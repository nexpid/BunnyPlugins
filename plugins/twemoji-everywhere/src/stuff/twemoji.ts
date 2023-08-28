import rawEmojiRegex from "twemoji-parser/dist/lib/regex";
import { vstorage } from "..";
const emojiRegex = new RegExp(`(${rawEmojiRegex.source})`, rawEmojiRegex.flags);

export interface EmojiPack {
  title: string;
  format: (src: string) => string;
}

export const emojipacks = {
  default: {
    title: "Default (Twemoji)",
    format: (src) => `asset:/emoji-${src}.png`,
  } as EmojiPack,
  // fluentuiStatic: {
  //   title: "FluentUI Emoji (Static)",
  //   format: (src) =>
  //     `https://raw.githubusercontent.com/AdvenaHQ/fluent-emoji/main/dist/100x100/${src}.png`,
  // } as EmojiPack,
  // fluentuiAnimated: {
  //   title: "FluentUI Emoji (Animated)",
  //   format: (src) =>
  //     `https://raw.githubusercontent.com/AdvenaHQ/fluent-emoji/main/dist/100x100/${src}.png`,
  // } as EmojiPack,
};

export function getSrc(src: string) {
  return (
    emojipacks[vstorage.emojipack]?.format(src) ??
    emojipacks.default.format(src)
  );
}

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
