import { findByProps } from "@vendetta/metro";
import { plugins } from "@vendetta/plugins";

const { canUseIncreasedMessageLength } = findByProps(
  "canUseIncreasedMessageLength"
);

// thanks rosie
export function prettify(x: number): string {
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
