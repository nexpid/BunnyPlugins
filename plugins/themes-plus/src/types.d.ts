export interface IconPack {
  id: string;
  description: string;
  credits: {
    authors: string[];
    source: string;
  };
  load?: string;
}

export interface IconPackData {
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
