import { ReactNative as RN } from "@vendetta/metro/common";
import { getPlusData } from "./plusLookup";
import { before } from "@vendetta/patcher";
import { getIconTint } from "../handlers/icons";

export default (): (() => void) => {
  const patches = new Array<() => void>();

  const plus = getPlusData();
  console.log(plus);

  // icon tints
  if (plus?.version !== undefined) {
    console.log(plus);
    if (plus.icons)
      patches.push(
        before("render", RN.Image, ([x]) => {
          if (!x.source || typeof x.source !== "number") return;

          const tint = getIconTint(plus, x.source);
          if (tint) {
            x.style ??= [];
            if (!Array.isArray(x.style)) x.style = [x.style];
            x.style = x.style.concat({
              tintColor: tint,
            });
          }
        })
      );
  }

  return () => patches.forEach((x) => x());
};
