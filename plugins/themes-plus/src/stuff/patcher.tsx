import { ReactNative as RN, React } from "@vendetta/metro/common";
import { getPlusData } from "./plusLookup";
import { after, instead } from "@vendetta/patcher";
import { getIconTint } from "../handlers/icons";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { findInReactTree } from "@vendetta/utils";
import { getUnreadBadgeColor } from "../handlers/unreadBadge";
import { getIconOverlay } from "../handlers/iconOverlays";
import { getAssetByID, getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { addToStyle, flattenStyle, reloadUI } from "./util";
import { PlusStructure } from "../../../../stuff/typings";
import resolveColor, { androidifyColor } from "./resolveColor";
import { PatchType, active, cacheID, enabled, vstorage } from "..";
import constants from "./constants";
import { CoolAsset, IconPack, IconPackConfig, IconPackData } from "../types";
import fixer from "../handlers/iconpacks/fixer";

const { View } = General;
const MaskedBadge = findByProps("MaskedBadge");
const RowGeneratorUtils = findByProps("createBackgroundHighlight");
const UserStore = findByStoreName("UserStore");

const iconpackNuhuhCache = new Array<string>();

export default async (): Promise<() => void> => {
  const patches = new Array<() => void>();

  const plus: PlusStructure = getPlusData();

  active.patches.length = 0;

  const iconpacks: IconPackData = (await (
    await fetch(constants.iconpacks.list)
  ).json()) as IconPackData;

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
    : iconpacks.list.find((x) => x.id === plus.iconpack);

  const iconpackConfig: IconPackConfig = iconpack
    ? vstorage.iconpack.url
      ? {
          biggerStatus: true,
        }
      : iconpack.config
      ? await (await fetch(iconpack.config)).json()
      : null
    : null;
  if (!enabled) return () => undefined;

  if (plus?.version !== undefined) {
    active.active = true;
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
          let source = x.source;

          // @ts-ignore these properties are missing from the Asset type
          const asset: CoolAsset = getAssetByID(source);
          const useIconpack =
            iconpack && !iconpackNuhuhCache.includes(asset.name);

          let overlay: any;
          if (plus.customOverlays && !useIconpack) {
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

          // thank you to @vending.machine (and @pylixonly)
          const forceUpdate = () =>
            (this as any)?.setState((s: any) => ({
              forceUpdate: ~(s.forceUpdate ?? 0),
            }));

          if (useIconpack) {
            x.onError = () => {
              if (!iconpackNuhuhCache.includes(asset.name))
                iconpackNuhuhCache.push(asset.name);
              forceUpdate();
            };

            x.source = {
              uri: `${iconpackURL}${[
                ...asset.httpServerLocation.split("/").slice(2),
                `${asset.name}${iconpack.suffix}.${asset.type}`,
              ].join("/")}?_=${cacheID}`,
            };
            x.style = flattenStyle(x.style);
            x.style.width ??= asset.width;
            x.style.height ??= asset.height;
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
        })
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
      active.patches.push(PatchType.MentionLineColor);

      patches.push(
        after("createBackgroundHighlight", RowGeneratorUtils, ([x], ret) => {
          const clr = resolveColor(plus.mentionLineColor);
          if (x?.message?.mentioned && clr)
            ret.gutterColor = androidifyColor(clr, 200);
        })
      );
    }
  } else active.active = false;

  if (iconpackConfig) fixer(iconpackConfig);

  if (active.patches.length) reloadUI();

  return () => patches.forEach((x) => x());
};
