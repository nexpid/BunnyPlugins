import { ReactNative as RN } from "@vendetta/metro/common";
import { getPlusData } from "./plusLookup";
import { after, before } from "@vendetta/patcher";
import { getIconTint } from "../handlers/icons";
import { reloadUI } from "./themeMatch";
import { findByProps } from "@vendetta/metro";
import { findInReactTree } from "@vendetta/utils";
import { PlusStructure } from "../types";
import { getUnreadBadgeColor } from "../handlers/unreadBadge";

const MaskedBadge = findByProps("MaskedBadge");

const addToStyle = (x: any, y: any) => {
  x.style ??= [];
  if (!Array.isArray(x.style)) x.style = [x.style];
  x.style = x.style.concat(y);
};

export default (): (() => void) => {
  const patches = new Array<() => void>();

  const plus = getPlusData();
  let patched = false;

  // icon tints
  if (plus?.version !== undefined) {
    if (plus.icons) {
      patched = true;
      patches.push(
        before("render", RN.Image, ([x]) => {
          if (!x.source || typeof x.source !== "number") return;

          const tint = getIconTint(plus, x.source);
          if (tint)
            addToStyle(x, {
              tintColor: tint,
            });
        })
      );
    }
    if (plus.unreadBadgeColor) {
      patched = true;
      patches.push(
        after("MaskedBadge", MaskedBadge, (_, ret) => {
          const badge =
            ret && findInReactTree(ret, (x) => x?.type?.name === "Badge");
          if (badge)
            patches.push(
              after(
                "type",
                badge,
                (_, bdg) =>
                  bdg?.props &&
                  addToStyle(bdg.props, {
                    backgroundColor: getUnreadBadgeColor(plus),
                  }),
                true
              )
            );
        })
      );
      patches.push(
        after(
          "default",
          MaskedBadge,
          (_, ret) =>
            ret?.props &&
            addToStyle(ret.props, {
              backgroundColor: getUnreadBadgeColor(plus),
            })
        )
      );
    }
  }

  if (patched) reloadUI();

  return () => {
    reloadUI();
    patches.forEach((x) => x());
  };
};
