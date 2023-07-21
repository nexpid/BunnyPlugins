export {};

declare global {
  namespace nativeModuleProxy {
    const BundleUpdaterManager: {
      reload: () => void;
    };
    const MMKVManager: {
      getItem: (key: string) => Promise<string | null>;
      removeItem: (key: string) => void;
      setItem: (key: string, value: string) => void;
      refresh: (exclude: string[]) => Promise<Record<string, string>>;
      // uhh apparently i'm gonna get murdered if i use this function?? yeah whatever i'll use it in all my plugins lol...
      clear: () => void;
    };
  }

  var __vendetta_loader:
    | {
        features: {
          syscolors?: { prop: string };
        };
      }
    | undefined;
  var __vendetta_theme: Theme | undefined;

  var CSmigrationStage: number | undefined;
}
