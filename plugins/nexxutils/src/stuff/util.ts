export function article(word: string) {
  if (word === "M3") return "an";
  return /^[aeiou]/i.test(word) ? "an" : "a";
}
