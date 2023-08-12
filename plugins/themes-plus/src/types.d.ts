export interface IconPackConfig {
  biggerStatus?: boolean;
}

export interface IconPack {
  id: string;
  description: string;
  credits: {
    authors: string[];
    source: string;
  };
  config: string | null;
  suffix: string | null;
  load: string | null;
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
