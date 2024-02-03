import { findByProps, findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { after, instead } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";
import { getAssetByID, getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { findInReactTree, safeFetch } from "@vendetta/utils";

import { resolveSemanticColor } from "$/types";
import { PlusStructure } from "$/typings";

import {
  active,
  cacheID,
  enabled,
  InactiveReason,
  PatchType,
  vstorage,
} from "..";
import { getIconOverlay } from "../handlers/iconOverlays";
import fixer from "../handlers/iconpacks/fixer";
import fixIcons from "../handlers/iconpacks/fixIcons";
import { getIconTint } from "../handlers/icons";
import { getUnreadBadgeColor } from "../handlers/unreadBadge";
import { CoolAsset, IconPack, IconPackConfig, IconPackData } from "../types";
import constants from "./constants";
import { getPlusData } from "./plusLookup";
import resolveColor, { androidifyColor } from "./resolveColor";
import { addToStyle, flattenStyle, queueReloadUI } from "./util";

const { View } = General;
const MaskedBadge = findByProps("MaskedBadge");
const RowGeneratorUtils = findByProps("createBackgroundHighlight");
const UserStore = findByStoreName("UserStore");

export default async () => {
  const patches = new Array<() => void>();

  const shouldForce = vstorage.iconpack.force ?? vstorage.iconpack.url;

  const cplus: PlusStructure | false = getPlusData();
  if (!shouldForce)
    if (cplus === false) {
      active.blehhh.push(InactiveReason.NoTheme);
      return;
    } else if (!cplus) {
      active.blehhh.push(InactiveReason.ThemesPlusUnsupported);
      return;
    }

  const plus: PlusStructure = cplus !== false ? cplus : { version: 0 };

  active.patches.length = 0;

  let iconpacks: IconPackData = {
    $schema: "",
    list: [],
  };
  try {
    iconpacks = (await (
      await safeFetch(`${constants.iconpacks.list}?_=${cacheID}`)
    ).json()) as IconPackData;
  } catch {
    active.blehhh.push(InactiveReason.NoIconpacksList);
  }

  active.iconpackList = iconpacks.list;

  const user = UserStore.getCurrentUser();
  const iconpack: IconPack = vstorage.iconpack?.url
    ? {
        id: "custom-iconpack",
        description: "A custom iconpack!",
        credits: {
          authors: [`${user.username} <${user.id}>`],
          source: "N/A",
        },
        config: null,
        suffix: vstorage.iconpack.suffix,
        load: vstorage.iconpack.url,
      }
    : iconpacks.list.find(
        (x) => x.id === plus.iconpack || x.id === vstorage.iconpack.force,
      );

  let iconpackConfig: IconPackConfig = null;
  if (vstorage.iconpack.url)
    iconpackConfig = {
      biggerStatus: true,
    };
  else if (iconpack?.config)
    try {
      iconpackConfig = await (
        await safeFetch(`${iconpack.config}?_=${cacheID}`)
      ).json();
    } catch {
      active.blehhh.push(InactiveReason.NoIconpackConfig);
    }

  let iconpackPaths = new Array<string>();
  if (iconpack)
    try {
      iconpackPaths = (
        await (
          await safeFetch(
            `${constants.iconpacks.tree(iconpack.id)}?_=${cacheID}`,
          )
        ).text()
      )
        .replace(/\r/g, "")
        .split("\n");
    } catch {
      active.blehhh.push(InactiveReason.NoIconpackFiles);
    }

  if (!enabled) return () => undefined;

  if (plus?.version !== undefined) {
    active.active = true;
    if (iconpackConfig) fixer(iconpackConfig);
    if (plus.icons || plus.customOverlays || iconpack) {
      if (plus.icons) active.patches.push(PatchType.Icons);
      if (plus.customOverlays)
        active.patches.push(PatchType.CustomIconOverlays);
      if (iconpack) active.patches.push(PatchType.IconPack);

      active.iconpack = iconpack ?? null;

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
            (iconpackPaths.length
              ? iconpackPaths.includes(assetIconpackLocation)
              : true);

          let overlay: any;
          if (plus.customOverlays && !useIconpack) {
            overlay = getIconOverlay(
              plus,
              source,
              x.style ? (Array.isArray(x.style) ? x.style : [x.style]) : [],
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

          if (useIconpack) {
            x.source = {
              uri: `${iconpackURL}${assetIconpackLocation}?_=${cacheID}`,
            };
            x.style = flattenStyle(x.style);
            x.style.width ??= asset.width;
            x.style.height ??= asset.height;

            const icClr = fixIcons.find((x) => x[0] === asset.name)?.[1];
            if (icClr)
              x.style.tintColor ??= semanticColors[icClr]
                ? resolveSemanticColor(semanticColors[icClr])
                : "#fff";
          }

          const ret = orig(...args);

          if (overlay?.children && !useIconpack)
            return (
              <View>
                {ret}
                {overlay.children}
              </View>
            );
          else return ret;
        }),
      );
    }
    if (plus.unreadBadgeColor) {
      active.patches.push(PatchType.UnreadBadgeColor);

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
                true,
              ),
            );
        }),
      );
      patches.push(
        after(
          "default",
          MaskedBadge,
          (_, ret) =>
            ret?.props &&
            addToStyle(ret.props, {
              backgroundColor: getUnreadBadgeColor(plus),
            }),
        ),
      );
    }
    if (plus.mentionLineColor) {
      // ty to cynthia
      active.patches.push(PatchType.MentionLineColor);

      patches.push(
        after("createBackgroundHighlight", RowGeneratorUtils, ([x], ret) => {
          const clr = resolveColor(plus.mentionLineColor);
          if (x?.message?.mentioned && clr)
            ret.gutterColor = androidifyColor(clr, 200);
        }),
      );
    }
  } else active.active = false;

  const patched = active.patches.length;
  if (patched) queueReloadUI();

  return (exit: boolean) => {
    if (patched && exit) queueReloadUI();
    patches.forEach((x) => x());
  };
};
