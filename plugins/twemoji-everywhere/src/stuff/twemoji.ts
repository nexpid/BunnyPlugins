import rawEmojiRegex from "twemoji-parser/dist/lib/regex";
const emojiRegex = new RegExp(`(${rawEmojiRegex.source})`, rawEmojiRegex.flags);

export function convert(emoji: string): string {
  return Array.from(emoji)
    .map((x) => x?.codePointAt(0)?.toString(16))
    .filter((x) => !!x)
    .join("-");
}

export function parse(
  text: string,
  callback: (src: string) => React.ReactNode
): string[] {
  // since when can String.split do this???
  const children: any[] = text.split(emojiRegex);

  for (let i = 1; i < children.length; i += 2)
    children.splice(i, 2, callback(convert(children[i])));

  return children;
}
