import { find, findByName, findByStoreName } from "@vendetta/metro";
import { i18n, React, ReactNative as RN } from "@vendetta/metro/common";
import { after, before } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { openModal } from "$/types";

import { addHidden, isHidden } from "..";
import GuildsWrapper from "../components/GuildsWrapper";
import ManageHiddenServersModal from "../components/modals/ManageHiddenServersModal";
import { HiddenListEntryType } from "../types";

const SortedGuildStore = findByStoreName("SortedGuildStore");

const GuildPopoutMenu = find(
  (x) => x?.default?.render?.name === "GuildPopoutMenu",
)?.default;
const FolderPopoutMenu = find(
  (x) => x?.default?.render?.name === "FolderPopoutMenu",
)?.default;
const GuildsConnected = findByName("GuildsConnected", false);

const GuildContainer = findByName("GuildContainer", false);

export default function () {
  const patches = new Array<() => void>();

  if (GuildPopoutMenu)
    patches.push(
      after("render", GuildPopoutMenu, ([{ guildId, title }], ret) => {
        const clone = { ...ret };
        if (!isHidden(HiddenListEntryType.Guild, guildId))
          clone.props.rows.unshift({
            text: "Hide Server",
            icon: getAssetIDByName("ic_hide_password"),
            onClick: () => {
              addHidden(HiddenListEntryType.Guild, guildId);
              showToast(`Hid ${title}`, getAssetIDByName("ic_hide_password"));
            },
          });
        return clone;
      }),
    );
  if (FolderPopoutMenu)
    patches.push(
      after("render", FolderPopoutMenu, ([{ title, folderId }], ret) => {
        const clone = { ...ret };
        if (!isHidden(HiddenListEntryType.Folder, folderId))
          clone.props.rows.unshift({
            text: "Hide Folder",
            icon: getAssetIDByName("ic_hide_password"),
            onClick: () => {
              addHidden(HiddenListEntryType.Folder, folderId);
              showToast(`Hid ${title}`, getAssetIDByName("ic_hide_password"));
            },
          });
        return clone;
      }),
    );

  if (GuildContainer?.default)
    patches.push(
      before(
        "default",
        GuildContainer,
        ([
          {
            contextMenuProps: { items },
            children: {
              props: { guild, guildIds },
            },
          },
        ]) => {
          if (guild && !guildIds)
            items.unshift({
              label: "Hide Balls",
              icon: getAssetIDByName("ic_hide_password"),
              action: () => {
                addHidden(HiddenListEntryType.Guild, guild.id);
                showToast(
                  `Hid ${guild.name}`,
                  getAssetIDByName("ic_hide_password"),
                );
              },
            });
          else if (!guild && guildIds)
            items.unshift({
              label: "Hide Ballocks",
              icon: getAssetIDByName("ic_hide_password"),
              action: () => {
                const folder = SortedGuildStore.getGuildFolders().find(
                  (x: any) =>
                    JSON.stringify(x.guildIds) === JSON.stringify(guildIds),
                );
                if (!folder?.folderId)
                  return showToast(
                    "Internal error!",
                    getAssetIDByName("Small"),
                  );

                addHidden(HiddenListEntryType.Folder, folder.folderId);
                showToast(
                  `Hid ${folder.folderName}`,
                  getAssetIDByName("ic_hide_password"),
                );
              },
            });
        },
      ),
    );

  patches.push(
    after("default", GuildsConnected, (_, ret) => {
      console.log("FUCK YOU MEAN RET??", ret);
      return React.createElement(GuildsWrapper, { ret });
    }),
  );

  patches.push(
    before("TouchableWithoutFeedback", RN, (args) => {
      const clone = [...args];
      if (clone[0].accessibilityLabel === i18n.Messages.DIRECT_MESSAGES)
        clone[0].onLongPress = () =>
          openModal("MANAGE_HIDDEN_SERVERS", ManageHiddenServersModal);
      return clone;
    }),
  );

  patches.push(
    //@ts-expect-error not in RN typings
    before("render", RN.Pressable.type, (args) => {
      const clone = [...args];
      if (clone[0].accessibilityLabel === "Create or join a server")
        clone[0].onLongPress = () =>
          openModal("MANAGE_HIDDEN_SERVERS", ManageHiddenServersModal);
      return clone;
    }),
  );

  return () => patches.forEach((x) => x());
}
