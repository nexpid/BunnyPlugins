export type PluginsFullJson = {
  name: string;
  description: string;
  authors: {
    name: string;
    id: string;
  }[];
  main: string;
  vendetta: {
    icon?: string;
    original: string;
  };
  hash: string;
}[];
