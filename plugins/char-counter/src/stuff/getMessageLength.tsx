import { findByProps } from "@vendetta/metro";
import { plugins } from "@vendetta/plugins";

const { canUseIncreasedMessageLength } = findByProps(
  "canUseIncreasedMessageLength"
);

export function stringify(x: number): string {
  if (x === Infinity) return "∞";
  else return x.toString();
}

export default () => {
  if (Object.keys(plugins).find((x) => x.includes("SplitLargeMessages")))
    return Infinity;
  else if (canUseIncreasedMessageLength()) return 4000;
  else return 2000;
};
