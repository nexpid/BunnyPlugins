declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.png" {
  const content: string;
  export default content;
}
declare module "*.css" {
  const content: string;
  export default content;
}

interface Window {
  nx?: {
    readonly semantic: Record<
      string,
      Record<"dark" | "darker" | "light" | "amoled", string>
    >;
    findColor: (hex: string) => any;
  };
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
    DCDSoundManager: {
      pause: (soundId: number) => void;
      play: (soundId: number) => void;
      stop: (soundId: number) => void;
      prepare: (
        url: string,
        type: "notification",
        soundId: number,
        callback: (
          error: any,
          meta: { numberOfChannels: number; duration: number }
        ) => any
      ) => void;
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
