/**
 * Word lists for the server-side censor. Extend freely: write roots in lowercase
 * Latin or Cyrillic letters. Do not use "й", "ё", "ь" or "ъ" (the normaliser folds
 * й→и, ё→е and drops ь/ъ, so write "хуи" for "хуй", "блят" for "блять").
 *
 * Doubled letters in a root ("ss", "гг") require at least two in the text; every
 * other letter may repeat ("fuuuck"). Vowels may also be masked ("f*ck", "sh*t").
 *
 * Match kinds (pick the strictest that still catches the word):
 *   contains: anywhere inside a word. Only for long, distinctive roots.
 *   prefix:   at the start of a word (Russian roots also accept a verb prefix such as "по", "на").
 *   exact:    the whole word (English: plus an optional plural "s"/"es").
 */
export interface Lexicon {
  contains: string[];
  prefix: string[];
  exact: string[];
}

export const EN: Lexicon = {
  contains: [
    "fuck", "bullshit", "horseshit", "dipshit", "bitch", "asshole", "arsehole", "asswipe", "asshat", "dumbass", "jackass", "faggot",
    "dickhead", "cocksuck", "blowjob", "motherfuck",
    // Transliterated Russian
    "blyat", "blyad", "pizd", "pidor", "pidar", "mudak", "zalup",
  ],
  prefix: ["shit", "cunt", "whore", "bastard", "wank", "douche", "retard", "xuy", "xui", "nahuy", "nahui", "pohuy", "pohui", "ebanat", "ebat"],
  exact: [
    "ass", "dick", "cock", "pussy", "twat", "slut", "fag", "kike", "spic", "tranny", "cum", "jizz", "bollocks", "piss", "pissed", "pissing", "pisser",
    "nigger", "nigga", "niggaz", "suka", "cyka",
  ],
};

export const RU: Lexicon = {
  contains: [
    "пизд", "хуесос", "хуисос", "пидорас", "пидарас", "долбоеб", "долбаеб", "мудозвон", "залуп", "ебанат", "ебанут", "еблан", "гандон", "гондон", "шлюх",
  ],
  prefix: [
    "хуи", "хуя", "хуе", "хую", "бляд", "блят", "ебан", "ебат", "ебал", "ебну", "ебуч", "ебис", "ебл", "уебок", "уебан", "мудак", "мудил", "мудач",
    "пидор", "пидар", "пидр", "говн", "дерьм", "дроч", "мраз", "ниггер", "залуп",
  ],
  exact: [
    "бля", "сука", "суки", "суку", "суке", "сукой", "сукам", "сучка", "сучки", "сучку", "сучке", "сучкой", "хер", "хера", "херу", "хером", "хере", "нахер", "похер",
    "жопа", "жопы", "жопе", "жопу", "жопой", "срать", "срет", "срут", "срал", "чмо", "ебло", "еблом", "ебу", "еби", "хач", "хачи", "чурка", "чурки", "чурку",
  ],
};

/** Optional verb prefixes allowed in front of Russian "prefix" roots (на+хуй, по+хуй, вы+ебал…). */
export const RU_PREFIXES = ["на", "за", "вы", "от", "по", "при", "раз", "рас", "с", "у", "до", "об", "о", "под", "про", "пере", "вз", "в", "из", "ис", "недо"];

/** Harmless words the roots would otherwise catch once repeats are collapsed. Compared after normalisation. */
export const ALLOW = new Set(["shiitake", "shiitakes", "scunthorpe", "cumin", "cumbria"]);
