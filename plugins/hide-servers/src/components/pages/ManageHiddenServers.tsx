import { findByProps, findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General, Search } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { hideActionSheet } from "$/types";

import { hiddenList, isHidden, removeHidden } from "../..";
import { HiddenListEntryType } from "../../types";

const { View } = General;
const { FormRow } = Forms;

const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");
const SortedGuildStore = findByStoreName("SortedGuildStore");
const GuildStore = findByStoreName("GuildStore");

// another built in color lol
const defaultFolderClr = "#5865f2";

export const ManageDataPage = () => {
  useProxy(hiddenList);
  const [search, setSearch] = React.useState("");

  const guilds = GuildStore.getGuilds();
  const data: {
    id: string | number;
    name: string;
    icon?: string;
    color?: number;
    type: HiddenListEntryType;
  }[] = SortedGuildStore.getGuildFolders()
    .filter((x) =>
      x.folderId
        ? isHidden(HiddenListEntryType.Folder, x.folderId)
        : x.guildIds.every((y) => isHidden(HiddenListEntryType.Guild, y)),
    )
    .map((x) => {
      const item = !x.folderId ? guilds[x.guildIds[0]] : x;
      if (!item) return;
      return {
        id: item.folderId ?? item.id,
        name: item.folderName ?? item.name,
        icon: item.icon,
        color:
          item.folderId &&
          (item.folderColor
            ? RN.processColor(item.folderColor)
            : defaultFolderClr),
        type: item.folderId
          ? HiddenListEntryType.Folder
          : HiddenListEntryType.Guild,
      };
    })
    .filter((x) => x && (x.name ?? "Unnamed").toLowerCase().includes(search));

  return (
    <RN.FlatList
      ListHeaderComponent={
        <Search
          style={{ marginBottom: 10 }}
          onChangeText={(x) => setSearch(x.toLowerCase())}
        />
      }
      style={{ paddingHorizontal: 10, paddingTop: 10 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      data={data}
      renderItem={({ item }) => (
        <FormRow
          label={item.name}
          leading={
            item.icon ? (
              <RN.Image
                source={{
                  uri: `https://cdn.discordapp.com/icons/${item.id}/${
                    item.icon
                  }.${item.icon.startsWith("a_") ? "gif" : "png"}?size=32`,
                }}
                style={{ height: 32, width: 32, borderRadius: 16 }}
              />
            ) : (
              <View
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 8,
                  backgroundColor: item.color,
                }}
              />
            )
          }
          onPress={() =>
            showSimpleActionSheet({
              key: "CardOverflow",
              header: {
                title: item.name,
                onClose: hideActionSheet,
              },
              options: [
                {
                  label: "Remove",
                  icon: getAssetIDByName("ic_message_delete"),
                  isDestructive: true,
                  onPress: () => {
                    showToast(
                      `Removed ${item.name} from hidden list`,
                      getAssetIDByName("ic_hide_password"),
                    );
                    removeHidden(item.type, item.id);
                  },
                },
              ],
            })
          }
        />
      )}
      removeClippedSubviews={true}
    />
  );
};

export function openManageHiddenServersPage(navigation: any) {
  navigation.push("VendettaCustomPage", {
    title: "Manage Hidden Servers",
    render: ManageDataPage,
  });
}
