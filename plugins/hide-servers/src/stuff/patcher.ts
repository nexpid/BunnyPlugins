import { find, findByName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { addHidden, isHidden } from "..";
import GuildsWrapper from "../components/GuildsWrapper";
import { HiddenListEntryType } from "../types.d";

const { default: GuildPopoutMenu } = find(
  (x) => x?.default?.render?.name === "GuildPopoutMenu"
);
const { default: FolderPopoutMenu } = find(
  (x) => x?.default?.render?.name === "FolderPopoutMenu"
);
const GuildsConnected = findByName("GuildsConnected", false);

export default function () {
  const patches = new Array<() => void>();

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
    })
  );
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
    })
  );

  patches.push(
    after("default", GuildsConnected, (_, ret) =>
      React.createElement(GuildsWrapper, { ret })
    )
  );

  return () => patches.forEach((x) => x());
}
