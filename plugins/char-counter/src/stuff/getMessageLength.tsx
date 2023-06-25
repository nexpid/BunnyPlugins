import { findByProps } from "@vendetta/metro";
import { plugins } from "@vendetta/plugins";
import { vstorage } from "..";

const { canUseIncreasedMessageLength } = findByProps(
  "canUseIncreasedMessageLength"
);

// thanks rosie
export function prettify(x: number): string {
  if (!vstorage.commas) return x.toString();
  else
    return x
      .toString()
      .split("")
      .reverse()
      .map((x, i, a) => (i % 3 === 0 && a.length > 3 && i !== 0 ? `${x},` : x))
      .reverse()
      .join("");
}

export default () => {
  if (Object.keys(plugins).find((x) => x.includes("SplitLargeMessages")))
    return Infinity;
  else if (canUseIncreasedMessageLength()) return 4000;
  else return 2000;
};
