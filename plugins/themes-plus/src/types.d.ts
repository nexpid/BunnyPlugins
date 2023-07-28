export interface PlusStructureV0 {
  icons?: {
    [icon: string]: string | (string | undefined)[];
  };
  unreadBadgeColor?: string | (string | undefined)[];
  customOverlays?: boolean;
  version: 0;
}

export type PlusStructure = PlusStructureV0;
