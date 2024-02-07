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
declare module "*.html" {
  const content: string;
  export default content;
}

declare const IS_DEV: boolean;
declare const DEV_LANG:
  | Record<string, Record<string, string>>
  | null
  | undefined;

// Buffer types coming soon:tm:
declare const Buffer: any;

interface Window {
  nx?: {
    readonly semantic: Record<
      string,
      Record<"dark" | "darker" | "light" | "amoled", string>
    >;
    searchSemantic: (query: string) => any;
    findSemantic: (hex: string) => any;
    p: {
      wipe: () => void;
      snipe: (
        prop: string,
        parent: any,
        callback?: (args: any[], ret: any) => any,
        oneTime?: boolean,
      ) => void;
      props: {
        collect: (key: string, prop: string, parent: any) => void;
        redeem: (key: string, save?: boolean) => object | undefined;
      };
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

  TPfirstLoad: boolean | undefined;
}
