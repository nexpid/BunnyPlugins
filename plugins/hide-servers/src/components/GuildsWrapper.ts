import { useProxy } from "@vendetta/storage";
import { findInReactTree } from "@vendetta/utils";

import { hiddenList, isHidden } from "..";
import { HiddenListEntryType } from "../types";

export default ({ ret }: { ret: any }) => {
  useProxy(hiddenList);

  const guilds = findInReactTree(ret, (x) => x?.type?.name === "Guilds")?.props;
  if (!guilds) return;

  const hidden = {
    guilds: [],
    folders: [],
  };
  for (const x of guilds.guildFolders) {
    if (isHidden(HiddenListEntryType.Folder, x.folderId)) {
      hidden.folders.push(x.folderId);
      for (const g of x.guildIds) hidden.guilds.push(g);
    } else
      for (const g of x.guildIds.filter((y) =>
        isHidden(HiddenListEntryType.Guild, y),
      ))
        hidden.guilds.push(g);
  }

  for (const g of hidden.guilds) {
    guilds.unreadGuilds.delete(g);
    delete guilds.guildReadStates[g];
  }

  guilds.guildFolders = guilds.guildFolders
    .filter((x) =>
      x.folderId ? !isHidden(HiddenListEntryType.Folder, x.folderId) : true,
    )
    .map((x) => ({
      ...x,
      guildIds: x.guildIds.filter(
        (y) => !isHidden(HiddenListEntryType.Guild, y),
      ),
    }));

  return ret;
};
