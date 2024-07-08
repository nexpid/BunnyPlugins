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
declare const DEFAULT_LANG: Record<string, string> | undefined;
declare const DEV_LANG: Record<string, Record<string, string>> | undefined;

// simple Buffer type
type Encoding = "base64" | "utf8" | "ascii";
declare const Buffer: {
  from: (
    data: any,
    encoding?: Encoding,
  ) => {
    toString(encoding?: Encoding): string;
  };
};

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
        collect: (
          key: string,
          prop: string,
          parent: any,
          parser?: (obj: any) => any,
        ) => void;
        redeem: (key: string, save?: boolean) => object | undefined;
      };
    };
  };
}
