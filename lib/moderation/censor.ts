import { ALLOW, EN, RU, RU_PREFIXES, type Lexicon } from "@/data/moderation";

export interface ModerationResult {
  /** Text with every offending word replaced by `***`. */
  clean: string;
  flagged: boolean;
  /** Distinct roots from data/moderation.ts that matched. */
  matches: string[];
}

const MASK = "***";
const WILDCARD = "\u0000";

// ── Normalisation ───────────────────────────────────────────────────────────

const CYR_TO_LAT: Record<string, string> = { а: "a", в: "b", е: "e", к: "k", м: "m", н: "h", о: "o", р: "p", с: "c", т: "t", у: "y", х: "x", і: "i", ѕ: "s", ј: "j", ь: "", ъ: "" };
const LAT_TO_CYR: Record<string, string> = { a: "а", b: "в", c: "с", e: "е", h: "н", k: "к", m: "м", o: "о", p: "р", s: "с", t: "т", x: "х", y: "у", i: "и" };
const LEET_LAT: Record<string, string> = { "0": "o", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", $: "s" };
const LEET_CYR: Record<string, string> = { "0": "о", "1": "и", "3": "е", "4": "а", "5": "с", "6": "б", "7": "т", "8": "в", "@": "а", $: "с" };

/** Lowercase, drop accents and invisible characters, fold fullwidth forms; й→и, ё→е. */
const fold = (s: string) => s.normalize("NFKD").replace(/[\p{M}\p{Cf}]/gu, "").toLowerCase();

/** Latin-alphabet readings of a word (Cyrillic look-alikes → Latin, leetspeak → letters). "1" may be i or l. */
function latinForms(s: string): string[] {
  const make = (one: string) => [...s].map((c) => CYR_TO_LAT[c] ?? (c === "1" ? one : (LEET_LAT[c] ?? c))).join("");
  const a = make("i");
  return s.includes("1") ? [a, make("l")] : [a];
}

/** Cyrillic-alphabet reading of a word (Latin look-alikes → Cyrillic, leetspeak → letters). */
const cyrillicForm = (s: string) => [...s].map((c) => (c === "ь" || c === "ъ" ? "" : (LAT_TO_CYR[c] ?? LEET_CYR[c] ?? c))).join("");

// ── Rule compilation ────────────────────────────────────────────────────────

const VOWELS = new Set([..."aeiouаеиоуыэюя"]);

/** "fuck" → f+u+c+k+ (any letter may repeat, vowels may be masked, doubled letters need 2+). */
function pattern(root: string): string {
  const chars = [...root];
  let out = "";
  for (let i = 0; i < chars.length; ) {
    let j = i;
    while (j < chars.length && chars[j] === chars[i]) j++;
    const c = chars[i];
    const cls = VOWELS.has(c) ? `[${c}\\u0000]` : c;
    out += j - i > 1 ? `${cls}{2,}` : `${cls}+`;
    i = j;
  }
  return out;
}

interface Rule {
  root: string;
  re: RegExp;
}

function compile(lex: Lexicon, ruPrefixes: boolean): Rule[] {
  const pre = ruPrefixes ? `(?:${RU_PREFIXES.join("|")})?` : "";
  const suffix = ruPrefixes ? "" : "(?:e?s)?";
  return [
    ...lex.contains.map((root) => ({ root, re: new RegExp(pattern(root), "u") })),
    ...lex.prefix.map((root) => ({ root, re: new RegExp(`^${pre}${pattern(root)}`, "u") })),
    ...lex.exact.map((root) => ({ root, re: new RegExp(`^${pattern(root)}${suffix}$`, "u") })),
  ];
}

const EN_RULES = compile(EN, false);
const RU_RULES = compile(RU, true);

/** The matched root for one candidate word, or null. */
function matchWord(raw: string): string | null {
  const s = fold(raw);
  if (!/\p{L}/u.test(s)) return null;
  for (const f of latinForms(s)) {
    if (ALLOW.has(f)) continue;
    const hit = EN_RULES.find((r) => r.re.test(f));
    if (hit) return hit.root;
  }
  const c = cyrillicForm(s);
  if (ALLOW.has(c)) return null;
  return RU_RULES.find((r) => r.re.test(c))?.root ?? null;
}

// ── Candidate generation ────────────────────────────────────────────────────

interface Piece {
  start: number;
  end: number;
  raw: string;
  letters: number;
}

const WORD_CHARS = /[\p{L}\p{M}\p{N}@$\p{Cf}]+/gu;
const MAX_RUN_CHARS = 30;
const MAX_WINDOW = 12;
const SUFFIXES = new Set(["s", "es", "ed", "er", "ers", "ing", "in", "y"]);

function tokenize(text: string): Piece[] {
  return [...text.matchAll(WORD_CHARS)].map((m) => ({
    start: m.index!,
    end: m.index! + m[0].length,
    raw: m[0],
    letters: (fold(m[0]).match(/\p{L}/gu) ?? []).length,
  }));
}

interface Hit {
  start: number;
  end: number;
  root: string;
}

function findHits(text: string): Hit[] {
  const pieces = tokenize(text);
  const hits: Hit[] = [];

  // A) every word on its own ("fuuuck", "sh1t", "ｆｕｃｋ").
  for (const p of pieces) {
    const root = p.letters ? matchWord(p.raw) : null;
    if (root) hits.push({ start: p.start, end: p.end, root });
  }

  // B) words split by punctuation with no spaces: "f.u.c.k", "fu-ck", "f*ck", "sh_it".
  for (let i = 0; i < pieces.length; i++) {
    let raw = pieces[i].raw;
    let j = i;
    while (j + 1 < pieces.length) {
      const gap = text.slice(pieces[j].end, pieces[j + 1].start);
      if (gap.length > 3 || /\s/.test(gap)) break;
      raw += (/^[*#%?^~+&]+$/.test(gap) ? WILDCARD : "") + pieces[j + 1].raw;
      j++;
    }
    if (j === i) continue;
    if (raw.length <= MAX_RUN_CHARS) {
      const root = matchWord(raw);
      if (root) hits.push({ start: pieces[i].start, end: pieces[j].end, root });
    }
    i = j;
  }

  // C) spaced-out letters: "f u c k", "f uck", "a s s" (runs of 1-2 letter words).
  const short = (p: Piece) => p.letters >= 1 && p.letters <= 2 && p.raw.length <= 3;
  for (let i = 0; i < pieces.length; i++) {
    if (!short(pieces[i])) continue;
    let raw = pieces[i].raw;
    for (let j = i + 1; j < pieces.length && j - i < MAX_WINDOW && short(pieces[j]); j++) {
      raw += pieces[j].raw;
      const root = raw.length >= 3 ? matchWord(raw) : null;
      if (root) {
        // Drop leading innocent letters ("a f u c k" → "f u c k").
        let from = i;
        while (from < j && matchWord(pieces.slice(from + 1, j + 1).map((p) => p.raw).join(""))) from++;
        // Take a spelled-out ending too ("f u c k i n g").
        let end = j;
        for (let k = j + 1; k < pieces.length && k <= j + 3 && short(pieces[k]); k++) {
          if (SUFFIXES.has(pieces.slice(j + 1, k + 1).map((p) => fold(p.raw)).join(""))) end = k;
        }
        hits.push({ start: pieces[from].start, end: pieces[end].end, root });
        i = end;
        break;
      }
    }
  }
  return hits;
}

/**
 * Finds profanity and slurs in English and Russian, however disguised (case, spacing,
 * punctuation, repeated letters, leetspeak, Latin/Cyrillic look-alikes) and masks each offending word.
 */
export function moderate(text: string): ModerationResult {
  const hits = findHits(text).sort((a, b) => a.start - b.start || b.end - a.end);
  if (!hits.length) return { clean: text, flagged: false, matches: [] };

  const spans: { start: number; end: number }[] = [];
  for (const h of hits) {
    const last = spans[spans.length - 1];
    if (last && h.start < last.end) last.end = Math.max(last.end, h.end);
    else spans.push({ start: h.start, end: h.end });
  }
  let clean = "";
  let at = 0;
  for (const s of spans) {
    clean += text.slice(at, s.start) + MASK;
    at = s.end;
  }
  clean += text.slice(at);
  return { clean, flagged: true, matches: [...new Set(hits.map((h) => h.root))] };
}
