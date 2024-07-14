import { findByStoreName, findByTypeName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { ActionSheet } from "$/components/ActionSheet";
import { BetterTableRowGroup } from "$/components/BetterTableRow";
import { Reanimated } from "$/deps";
import { buttonVariantPolyfill, IconButton } from "$/lib/redesign";

import { lang, vstorage } from "../..";

const GuildStore = findByStoreName("GuildStore");
const SortedGuildStore = findByStoreName("SortedGuildStore");

const { type: GuildFolderPreview } = findByTypeName("GuildFolderPreview");
const { type: GuildIconInner } = findByTypeName("GuildIconInner");

const { FormRow } = Forms;

function Row({
  guildId,
  folderId,
  remove,
}: {
  guildId?: string;
  folderId?: string;
  remove: (name: string) => void;
}) {
  const { guild, folder, name } = React.useMemo(() => {
    const guild = guildId && GuildStore.getGuild(guildId);
    const folder =
      folderId &&
      SortedGuildStore.getGuildFolders().find(
        (x: any) => x.folderId === folderId,
      );

    if (guild) return { guild, name: guild.name } as const;
    else if (folder)
      return {
        folder,
        name: folder.folderName,
      } as const;
  }, [guildId, folderId]);

  if (!name || (!guild && !folder)) return null;

  return (
    <FormRow
      label={name}
      leading={
        guild ? (
          <GuildIconInner
            size="LARGE"
            guild={guild}
            selected={false}
            nested={false}
            animate={true}
            preloadAnimation={true}
          />
        ) : (
          <GuildFolderPreview
            active={Reanimated.useSharedValue(false)}
            forceFolder={false}
            expanded={false}
            guildIds={folder.guildIds}
            folderColor={folder.folderColor}
          />
        )
      }
      trailing={
        <IconButton
          icon={getAssetIDByName("TrashIcon")}
          onPress={() => remove(guild?.name ?? folder?.folderName)}
          variant={buttonVariantPolyfill().destructive}
          size="md"
        />
      }
    />
  );
}

export default function HiddenServersSheet() {
  useProxy(vstorage);
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);

  return (
    <ActionSheet title={lang.format("sheet.hidden_servers.title", {})}>
      <BetterTableRowGroup>
        {vstorage.guilds.map((guild) => (
          <Row
            guildId={guild}
            remove={(name) => {
              showToast(
                lang.format("toast.unhid", { name }),
                getAssetIDByName("TrashIcon"),
              );
              vstorage.guilds = vstorage.guilds.filter((x) => x !== guild);
              forceUpdate();
            }}
          />
        ))}
      </BetterTableRowGroup>
      <BetterTableRowGroup nearby>
        {vstorage.folders.map((folder) => (
          <Row
            folderId={folder}
            remove={(name) => {
              showToast(
                lang.format("toast.unhid", { name }),
                getAssetIDByName("TrashIcon"),
              );
              vstorage.folders = vstorage.folders.filter((x) => x !== folder);
              forceUpdate();
            }}
          />
        ))}
      </BetterTableRowGroup>
    </ActionSheet>
  );
}
