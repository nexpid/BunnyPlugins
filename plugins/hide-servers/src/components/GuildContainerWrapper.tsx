import { useProxy } from "@vendetta/storage";

import { vstorage } from "..";

export default function GuildContainerWrapper({
  guildId,
  folderId,
  children,
}: React.PropsWithChildren<{
  guildId?: string;
  folderId?: string;
}>): React.ReactElement {
  useProxy(vstorage);

  const isHidden =
    vstorage.guilds.includes(guildId) || vstorage.folders.includes(folderId);
  return (isHidden ? null : children) as any;
}
