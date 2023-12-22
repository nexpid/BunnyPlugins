import { ReactNative as RN } from "@vendetta/metro/common";
import rawEmojiRegex from "twemoji-parser/dist/lib/regex";

import { vstorage } from "..";
const emojiRegex = new RegExp(`(${rawEmojiRegex.source})`, rawEmojiRegex.flags);

export interface EmojiPack {
  title: string;
  format: (src: string) => string;
}

export const emojipacks = {
  default: {
    get title() {
      return `Default (${RN.Platform.select({
        default: "Twemoji",
        ios: "iOs Emoji",
      })})`;
    },
    format: (src) => `asset:/emoji-${src}.png`,
  },
  twemoji: {
    title: "Twemoji (CDN)",
    format: (src) =>
      `https://cdn.jsdelivr.net/gh/twitter/twemoji@v14.0.2/assets/72x72/${src}.png`,
  },
  fluentuiStatic: {
    title: "FluentUI Emoji (Static)",
    format: (src) =>
      `https://raw.githubusercontent.com/bignutty/fluent-emoji/main/static/${src}.png`,
  },
  fluentuiAnimated: {
    title: "FluentUI Emoji (Animated)",
    format: (src) =>
      `https://raw.githubusercontent.com/bignutty/fluent-emoji/main/animated-static/${src}.png`,
  },
  notoEmoji: {
    title: "Noto Emoji",
    format: (src) =>
      `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/72/emoji_u${src
        .split("-")
        .filter((x) => x !== "fe0f")
        .map((x) => x.padStart(4, "0"))
        .join("_")}.png`,
  },
} satisfies Record<string, EmojiPack>;

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
  callback: (src: string) => React.ReactNode,
): string[] {
  // since when can String.split do this???
  const children: any[] = text.split(emojiRegex);

  for (let i = 1; i < children.length; i += 2)
    children.splice(i, 2, callback(convert(children[i])));

  return children;
}
