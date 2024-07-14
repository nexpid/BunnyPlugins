import { findByName, findByStoreName } from "@vendetta/metro";
import { i18n, ReactNative as RN } from "@vendetta/metro/common";
import { instead } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { ActionSheet } from "$/components/ActionSheet";
import { resolveSemanticColor } from "$/types";

import { lang, vstorage } from "..";
import GuildContainerWrapper from "../components/GuildContainerWrapper";
import HiddenServersSheet from "../components/sheets/HiddenServersSheet";

const SortedGuildStore = findByStoreName("SortedGuildStore");
const GuildContainer = findByName("GuildContainer", false);

const compareGuildIds = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

export default function () {
  const patches = new Array<() => void>();

  patches.push(
    instead("default", GuildContainer, ([data], orig) => {
      const props = data?.children?.props;
      if (!props) return orig.call(this, data);

      if (data.accessibilityLabel?.includes(i18n.Messages.DIRECT_MESSAGES)) {
        return orig.call(this, {
          ...data,
          onLongPress: () => ActionSheet.open(HiddenServersSheet, null),
        });
      }

      console.log("Ren durr");

      const guildId = props.guild?.id ?? null;
      const folderId = props.guildIds
        ? SortedGuildStore.getGuildFolders().find((x: any) =>
            compareGuildIds(x.guildIds, props.guildIds),
          )?.folderId
        : null;
      if (!guildId && !folderId) return orig.call(this, data);

      const context = [...data.contextMenuProps.items];
      context.splice(guildId ? 2 : 1, 0, {
        label: guildId
          ? lang.format("context.server.hide", {})
          : lang.format("context.folder.hide", {}),
        IconComponent: () => (
          <RN.Image
            source={getAssetIDByName("EyeSlashIcon")}
            resizeMode="cover"
            style={{
              width: 20,
              height: 20,
              tintColor: resolveSemanticColor(
                semanticColors.INTERACTIVE_NORMAL,
              ),
            }}
          />
        ),
        action: () => {
          if (guildId) vstorage.guilds.push(guildId);
          else vstorage.folders.push(folderId);

          showToast(
            lang.format("toast.hid", { name: data.contextMenuProps.title }),
            getAssetIDByName("EyeSlashIcon"),
          );
        },
      });

      const ret = orig.call(this, {
        ...data,
        contextMenuProps: {
          ...data.contextMenuProps,
          items: context,
        },
      });

      return (
        <GuildContainerWrapper guildId={guildId} folderId={folderId}>
          {ret}
        </GuildContainerWrapper>
      );
    }),
  );

  patches.push(lang.unload);

  return () => patches.forEach((x) => x());
}
