import { findByName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { before, instead } from "@vendetta/patcher";
import { getAssetByID, getAssetIDByName } from "@vendetta/ui/assets";

import { PlusStructure } from "$/typings";

import { PatchType } from "..";
import { state } from "../stuff/active";
import { getIconOverlay, getIconTint } from "../stuff/iconOverlays";
import { patches } from "../stuff/loader";
import { CoolAsset, IconpackConfig } from "../types";

const Status = findByName("Status", false);

export default function patchIcons(
  plus: PlusStructure,
  tree: string[],
  config: IconpackConfig,
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
    if (iconpack) state.patches.push(PatchType.Iconpack);

    patches.push(
      instead("render", RN.Image, (_args, orig) => {
        const args = _args.slice();
        const [x] = args;
        if (typeof x.source !== "number" || x.ignore) return orig(...args);
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
          overlay = getIconOverlay(plus, source, x.style);
          if (overlay) {
            if (overlay.replace) x.source = getAssetIDByName(overlay.replace);
            if (overlay.style) x.style = [x.style, overlay.style];
          }
        }

        if (plus.icons) {
          const tint = getIconTint(plus, source);
          if (tint)
            x.style = [
              x.style,
              {
                tintColor: tint,
              },
            ];
        }

        if (useIconpack) {
          x.source = {
            uri: iconpack.load + assetIconpackLocation,
            headers: {
              "cache-contorl": "public, max-age=3600",
            },
          };
        }

        const ret = orig(...args);

        return overlay?.children ? (
          <RN.View>
            {ret}
            {overlay.children}
          </RN.View>
        ) : (
          ret
        );
      }),
    );
  }
}
