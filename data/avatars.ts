// 8×8 pixel avatar presets. "." is transparent; letters map to the palette.
export interface AvatarDef {
  id: string;
  name: string;
  bg: string;
  palette: Record<string, string>;
  grid: string[];
}

export const AVATARS: AvatarDef[] = [
  { id: "bot", name: "LAB BOT", bg: "#22305E", palette: { a: "#3CE6B0", b: "#BFC8E8", c: "#0D1838", d: "#FF7EB6" },
    grid: ["...aa...", "...bb...", ".bbbbbb.", ".bcbbcb.", ".bbbbbb.", ".bddddb.", ".bbbbbb.", "..b..b.."] },
  { id: "cat", name: "PIXEL CAT", bg: "#6D5A9E", palette: { a: "#F4D4D1", c: "#0D1838", d: "#FF7EB6" },
    grid: ["a......a", "aa....aa", "aaaaaaaa", "acaaaaca", "aaaddaaa", "aaaaaaaa", ".aaaaaa.", "..a..a.."] },
  { id: "ghost", name: "GHOST", bg: "#2B2152", palette: { a: "#FFF4DC", c: "#6D5A9E" },
    grid: ["..aaaa..", ".aaaaaa.", "aacaacaa", "aacaacaa", "aaaaaaaa", "aaaaaaaa", "aaaaaaaa", "a.aa.aa."] },
  { id: "alien", name: "VISITOR", bg: "#16214A", palette: { a: "#7CF29A", c: "#0D1838" },
    grid: ["..a..a..", "...aa...", ".aaaaaa.", "accaacca", "aaaaaaaa", ".aaaaaa.", "..aaaa..", ".a.aa.a."] },
  { id: "floppy", name: "FLOPPY", bg: "#F4D4D1", palette: { a: "#5EB0FF", b: "#E8EEFF", c: "#0D1838" },
    grid: ["aaaaaaa.", "aacccaaa", "aacacaaa", "aaaaaaaa", "abbbbbba", "abbbbbba", "abbbbbba", "aaaaaaaa"] },
  { id: "joystick", name: "JOYSTICK", bg: "#22305E", palette: { a: "#FF5A6E", b: "#BFC8E8", c: "#B48CFF", d: "#FFD166" },
    grid: ["...aa...", "..aaaa..", "...aa...", "...bb...", "...bb.d.", ".cccccc.", "cccccccc", "cccccccc"] },
  { id: "monitor", name: "TINY PC", bg: "#6D5A9E", palette: { a: "#F4D4D1", b: "#3CE6B0", c: "#0D1838" },
    grid: ["aaaaaaaa", "abbbbbba", "abcbbcba", "abbbbbba", "abccccba", "aaaaaaaa", "...aa...", ".aaaaaa."] },
  { id: "frog", name: "FROG", bg: "#2B2152", palette: { a: "#3CE6B0", b: "#FFF4DC", c: "#0D1838" },
    grid: [".bb..bb.", "bcbaabcb", "aaaaaaaa", "aaaaaaaa", "acaaaaca", ".acccca.", "aaaaaaaa", "a.a..a.a"] },
  { id: "knight", name: "KNIGHT", bg: "#16214A", palette: { a: "#BFC8E8", c: "#0D1838", d: "#FF7EB6" },
    grid: ["...dd...", "..dda...", ".aaaaaa.", "aaaaaaaa", "acccccca", "aaaaaaaa", "aacaacaa", ".aaaaaa."] },
  { id: "mushroom", name: "SHROOM", bg: "#F4D4D1", palette: { a: "#FF5A6E", b: "#FFF4DC", c: "#0D1838" },
    grid: ["..aaaa..", ".abaaba.", "aaaaaaaa", "abaaaaba", "aaaaaaaa", "..bbbb..", "..bcbc..", "..bbbb.."] },
];

export const DEFAULT_AVATAR = "bot";
export const getAvatar = (id: string | null | undefined) => AVATARS.find((a) => a.id === id) ?? AVATARS[0];
