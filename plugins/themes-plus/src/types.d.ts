export interface IconPackConfig {
  biggerStatus?: boolean;
}

export interface IconPack {
  id: string;
  name: string;
  description: string;
  credits: {
    authors: {
      name: string;
      id?: string;
    }[];
    source: string;
  };
  config: string | null;
  suffix: string;
  load: string;
}

export interface IconPackData {
  $schema: string;
  list: IconPack[];
}

export interface CoolAsset {
  __packager_asset: boolean;
  httpServerLocation: string;
  width: number;
  height: number;
  scales: number[];
  hash: string;
  name: string;
  type: string;
}
