import { findByName } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";
import { before, instead } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";
import { getAssetByID, getAssetIDByName } from "@vendetta/ui/assets";

import { resolveSemanticColor } from "$/types";
import { PlusStructure } from "$/typings";

import { PatchType } from "..";
import { state } from "../stuff/active";
import constants from "../stuff/constants";
import { getIconOverlay, getIconTint } from "../stuff/iconOverlays";
import { patches } from "../stuff/loader";
import { IconPackConfig } from "../types";

enum FillColor {
  ButtonIcon = "BUTTON_SECONDARY_BACKGROUND_ACTIVE",
}

const iconFixes = [
  ["ic_mic_neutral", FillColor.ButtonIcon],
  ["ic_mic_muted_neutral", FillColor.ButtonIcon],
  ["ic_soundboard", FillColor.ButtonIcon],
  ["ic_soundboard_muted", FillColor.ButtonIcon],
  ["ic_video", FillColor.ButtonIcon],
  ["ic_video_disabled", FillColor.ButtonIcon],
] as [string, FillColor][];

const Status = findByName("Status", false);

export default function patchIcons(
  plus: PlusStructure,
  tree: string[],
  config: IconPackConfig,
) {
  const { iconpack } = state.iconpack;
  if (config.biggerStatus)
    patches.push(
      before("default", Status, (args) => {
        const c = [...args];

        const sizes = Object.values(Status.StatusSizes);
        c[0].size = sizes[sizes.findIndex((x) => c[0].size === x) + 1];
        c[0].size ??= Status.StatusSizes.XLARGE;

        return c;
      }),
    );

  if (plus.icons || plus.customOverlays || iconpack) {
    if (plus.icons) state.patches.push(PatchType.Icons);
    if (plus.customOverlays) state.patches.push(PatchType.CustomIconOverlays);
    if (iconpack) state.patches.push(PatchType.IconPack);

    const iconpackURL =
      iconpack &&
      (iconpack.load
        ? !iconpack.load.endsWith("/")
          ? iconpack.load + "/"
          : iconpack.load
        : `${constants.iconpacks.assets}${iconpack.id}/`);

    patches.push(
      instead("render", RN.Image, (_args, orig) => {
        const args = _args.slice();
        const [x] = args;
        if (!x.source || typeof x.source !== "number" || x.ignore)
          return orig(...args);
        const source = x.source;

        // @ts-expect-error these properties are missing from the Asset type
        const asset: CoolAsset = getAssetByID(source);
        const assetIconpackLocation =
          iconpack &&
          [
            ...asset.httpServerLocation.split("/").slice(2),
            `${asset.name}${iconpack.suffix}.${asset.type}`,
          ].join("/");
        const useIconpack =
          iconpack &&
          (tree.length ? tree.includes(assetIconpackLocation) : true);

        let overlay: any;
        if (plus.customOverlays && !useIconpack) {
          overlay = getIconOverlay(
            plus,
            source,
            x.style ? (Array.isArray(x.style) ? x.style : [x.style]) : [],
          );
          if (overlay) {
            if (overlay.replace) x.source = getAssetIDByName(overlay.replace);
            if (overlay.style) x.style = [x.style, overlay.style];
          }
        }

        if (plus.icons) {
          const tint = getIconTint(plus, source);
          if (tint)
            x.style = [
              x.stlye,
              {
                tintColor: tint,
              },
            ];
        }

        if (useIconpack) {
          x.source = {
            uri: `${iconpackURL}${assetIconpackLocation}`,
            headers: {
              "cache-contorl": "public, max-age=60",
            },
          };
          const style = {
            width: asset.width,
            height: asset.height,
          } as any;

          const icClr = iconFixes.find((x) => x[0] === asset.name)?.[1];
          if (icClr)
            style.tintColor ??= semanticColors[icClr]
              ? resolveSemanticColor(semanticColors[icClr])
              : "#fff";

          x.style = [style, x.style];
        }

        const ret = orig(...args);

        if (overlay?.children && !useIconpack)
          return (
            <RN.View>
              {ret}
              {overlay.children}
            </RN.View>
          );
        else return ret;
      }),
    );
  }
}
