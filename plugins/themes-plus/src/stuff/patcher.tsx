import { ReactNative as RN } from "@vendetta/metro/common";
import { getPlusData } from "./plusLookup";
import { after, instead } from "@vendetta/patcher";
import { getIconTint } from "../handlers/icons";
import { findByProps } from "@vendetta/metro";
import { findInReactTree } from "@vendetta/utils";
import { getUnreadBadgeColor } from "../handlers/unreadBadge";
import { getIconOverlay } from "../handlers/iconOverlays";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { addToStyle, reloadUI } from "./util";
import { PlusStructure } from "../../../../stuff/typings";
import resolveColor, { androidifyColor } from "./resolveColor";

const { View } = General;
const MaskedBadge = findByProps("MaskedBadge");
const RowGeneratorUtils = findByProps("createBackgroundHighlight");

export default (): (() => void) => {
  const patches = new Array<() => void>();

  const plus: PlusStructure = getPlusData();
  let patched = false;

  // icon tints
  if (plus?.version !== undefined) {
    if (plus.icons || plus.customOverlays) {
      patched = true;
      patches.push(
        instead("render", RN.Image, (args, orig) => {
          const [x] = args;
          if (!x.source || typeof x.source !== "number" || x.ignore)
            return orig(...args);
          let source = x.source;

          let overlay: any;
          if (plus.customOverlays) {
            overlay = getIconOverlay(
              plus,
              source,
              x.style ? (Array.isArray(x.style) ? x.style : [x.style]) : []
            );
            if (overlay) {
              if (overlay.replace) x.source = getAssetIDByName(overlay.replace);
              if (overlay.style) addToStyle(x, overlay.style);
            }
          }

          if (plus.icons) {
            const tint = getIconTint(plus, source);
            if (tint)
              addToStyle(x, {
                tintColor: tint,
              });
          }

          const ret = orig(...args);
          if (overlay?.children)
            return (
              <View>
                {ret}
                {overlay.children}
              </View>
            );
          else return ret;
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
    if (plus.mentionLineColor) {
      // ty to cynthia
      patched = true;
      patches.push(
        after("createBackgroundHighlight", RowGeneratorUtils, ([x], ret) => {
          const clr = resolveColor(plus.mentionLineColor);
          if (x?.message?.mentioned && clr)
            ret.gutterColor = androidifyColor(clr, 200);
        })
      );
    }
  }

  if (patched) reloadUI();

  return () => {
    reloadUI();
    patches.forEach((x) => x());
  };
};
