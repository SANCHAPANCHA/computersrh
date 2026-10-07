import { test } from "node:test";
import assert from "node:assert/strict";
import { moderate } from "./censor";
import { formatCountdown, punishmentFor, violationNotice } from "./sanctions";

const flagged = (t: string) => moderate(t).flagged;

test("detects plain profanity in English and Russian, any case", () => {
  for (const t of ["fuck", "FUCK you", "What The Fuck", "shit", "you bitch", "Cunt", "пизда", "ХУЙ", "ну ты и Сука", "блять", "блядь", "ебаный", "Пидорас", "мудак", "нахуй", "похуй", "охуенно"]) {
    assert.ok(flagged(t), t);
  }
});

test("catches spacing and separator bypasses", () => {
  for (const t of ["f u c k", "f.u.c.k", "F-U-C-K", "f_u_c_k", "f u c k i n g", "fu ck", "f*ck", "sh*t", "b*tch", "f.u.c.k.i.n.g", "х у й", "х.у.й", "п и з д а", "б л я т ь", "пи зд ец", "s h i t", "fu\u200bck"]) {
    assert.ok(flagged(t), t);
  }
});

test("catches repeated characters", () => {
  for (const t of ["fuuuuck", "fuuuck you", "shiiiit", "biiiitch", "хууууй", "пиздеееец", "блядддь", "asssss", "суууука"]) assert.ok(flagged(t), t);
});

test("catches leetspeak", () => {
  for (const t of ["sh1t", "$h1t", "5hit", "b1tch", "a55", "@ss", "a$$", "c0ck", "ху1", "п1зда"]) {
    assert.ok(flagged(t), t);
  }
  assert.ok(flagged("f\u00fcck"), "accented");
  assert.ok(flagged("\uff46\uff55\uff43\uff4b"), "fullwidth");
});

test("catches Latin/Cyrillic look-alike mixes", () => {
  // Cyrillic с/у/к/а mixed into Latin words and vice versa
  for (const t of ["fuсk", "bitсh", "shіt", "cyka blyat", "xуй", "хyй", "сyкa", "6лять", "суkа", "ебaный", "пидoр"]) {
    assert.ok(flagged(t), t);
  }
});

test("does not flag innocent words (Scunthorpe problem)", () => {
  for (const t of [
    "assistant", "class", "classic", "assess", "assassin", "bass", "pass", "passage", "mass", "glass", "grass", "Scunthorpe", "cocktail", "cockpit", "peacock", "dickens", "Dickinson",
    "analysis", "therapist", "shiitake", "cumin", "cucumber", "document", "button", "title", "hello", "computer", "motherboard", "bitcoin", "specs", "I am a pro",
    "застрахуйте", "скипидар", "оскорблять", "ребалансировка", "хулиган", "хуже", "херувим", "сучкорез", "потребитель", "сукно", "рубль", "лебединое", "истребитель", "расстрелять",
    "стрелять", "подъезд", "пехота", "оформление", "ну и ладно", "привет мир",
  ]) {
    assert.equal(flagged(t), false, t);
  }
});

test("ordinary sentences, numbers and rigs stay untouched", () => {
  for (const t of [
    "my rig has an rtx 4090 and 32gb of ddr5, score 455/100",
    "Is anyone else building a 5800x3d rig? I a m not sure",
    "to be or not to be, that is the question",
    "Привет! Собрал себе новый ПК, процессор и видеокарта огонь.",
    "https://x.com/ComputersRh/status/1234567890",
    "I'm at 100% and 1.5x speed, 7 days left, $5.55",
  ]) {
    assert.equal(flagged(t), false, t);
    assert.equal(moderate(t).clean, t);
  }
});

test("replaces only the offending word with ***", () => {
  assert.equal(moderate("you are a fuck noob").clean, "you are a *** noob");
  assert.equal(moderate("you are a f.u.c.k.i.n.g noob").clean, "you are a *** noob");
  assert.equal(moderate("hey, SHIT! that hurt.").clean, "hey, ***! that hurt.");
  assert.equal(moderate("ты пиздец какой нуб").clean, "ты *** какой нуб");
  assert.equal(moderate("ну ты и х у й, друг").clean, "ну ты и ***, друг");
  assert.equal(moderate("fuck shit").clean, "*** ***");
  assert.equal(moderate("you are all f u c k i n g great").clean, "you are all *** great");
  assert.equal(moderate("clean text").clean, "clean text");
});

test("reports matched roots", () => {
  const r = moderate("fuuuck this sh1t, блять");
  assert.equal(r.flagged, true);
  assert.deepEqual(r.matches.sort(), ["fuck", "shit", "блят"].sort());
  assert.deepEqual(moderate("hello").matches, []);
});

test("plurals and inflections of whole-word roots", () => {
  assert.ok(flagged("asses"));
  assert.ok(flagged("you ass"));
  assert.ok(flagged("dicks"));
  assert.ok(flagged("shitty"));
  assert.ok(flagged("motherfucker"));
  assert.ok(flagged("хуёвый"));
});

test("punishment ladder: 1h, 24h, then permanent", () => {
  assert.equal(punishmentFor(1), "mute_1h");
  assert.equal(punishmentFor(2), "mute_24h");
  assert.equal(punishmentFor(3), "permanent");
  assert.equal(punishmentFor(9), "permanent");
  assert.equal(violationNotice("MESSAGE", "mute_1h", 1), "MESSAGE CENSORED · CHAT MUTED FOR 1 HOUR (VIOLATION 1/3)");
  assert.equal(violationNotice("MESSAGE", "permanent", 5), "MESSAGE CENSORED · PERMANENT CHAT BAN (VIOLATION 3/3)");
});

test("countdown formatting", () => {
  assert.equal(formatCountdown(59 * 60_000 + 12_000), "59:12");
  assert.equal(formatCountdown(24 * 3600_000 - 1000), "23:59:59");
  assert.equal(formatCountdown(-5), "00:00");
});
