export enum HiddenListEntryType {
  Folder,
  Guild,
}
export type HiddenListEntry =
  | [HiddenListEntryType.Folder, number]
  | [HiddenListEntryType.Guild, string];
