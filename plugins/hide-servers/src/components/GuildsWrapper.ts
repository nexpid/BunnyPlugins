import { findByProps } from "@vendetta/metro";
import { useProxy } from "@vendetta/storage";
import { findInReactTree } from "@vendetta/utils";

import { hiddenList, isHidden } from "..";
import { HiddenListEntryType } from "../types";
// import { hiddenList } from "..";

const { inspect } = findByProps("format", "inspect");

export default ({ ret }: { ret: any }) => {
  useProxy(hiddenList);

  console.log("ren durrr...");
  console.log(
    `DEBUG\0SAVEFILE\0${JSON.stringify("penis_sex.txt")}\0${JSON.stringify(inspect(ret))}`,
  );
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
    guilds.unreadGuilds?.delete(g);
    delete guilds.guildReadStates[g];
  }

  // guilds.guildFolders = guilds.guildFolders
  //   .filter((x: any) =>
  //     x.folderId ? !isHidden(HiddenListEntryType.Folder, x.folderId) : true,
  //   )
  //   .map((x: any) => ({
  //     ...x,
  //     guildIds: x.guildIds.filter(
  //       (y: any) => !isHidden(HiddenListEntryType.Guild, y),
  //     ),
  //   }));
  guilds.guildFolders = [
    {
      index: 0,
      guildIds: ["1158475940343595008"],
      folderId: undefined,
      folderName: undefined,
      folderColor: undefined,
    },
  ];
  console.log("changed :)");

  return ret;
};
