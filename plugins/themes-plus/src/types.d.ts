export interface PlusStructureV1 {
  icons?: {
    [icon: string]: (string | undefined)[];
  };
  version: 1;
}

export type PlusStructure = PlusStructureV1;
