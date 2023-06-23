// can't use Record because TS complains about referencing itself
export type PluginSyncOptions = {
  [k: string]: number | boolean | PluginSyncOptions;
};
export interface PluginSync {
  id: string;
  enabled: boolean;
  options: PluginSyncOptions;
}

export interface ThemeSync {
  id: string;
  enabled: boolean;
}
export interface SaveSync {
  plugins: PluginSync[];
  themes: ThemeSync[];
}

export interface Save {
  user: string;
  sync: SaveSync;
  version: 1;
}
