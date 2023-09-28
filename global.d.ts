declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}

interface Window {
  nativeModuleProxy: {
    BundleUpdaterManager: {
      reload: () => void;
    };
    MMKVManager: {
      getItem: (key: string) => Promise<string | null>;
      removeItem: (key: string) => void;
      setItem: (key: string, value: string) => void;
      refresh: (exclude: string[]) => Promise<Record<string, string>>;
      clear: () => void;
    };
  };

  __vendetta_loader:
    | {
        features?: {
          themes?: { prop: string };
          syscolors?: { prop: string };
        };
      }
    | undefined;
  __vendetta_theme: Theme | undefined;

  CSmigrationStage: number | undefined;
  TPfirstLoad: boolean | undefined;
}
