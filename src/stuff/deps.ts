import { find, findByProps } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";
import { type StateStorage } from "zustand/middleware";

//
// JS deps
//
export const WebView = find(x => x?.WebView && !x.default)
    .WebView as typeof import("react-native-webview").default;

export const Svg = findByProps("SvgXml") as typeof import("react-native-svg");

// @ts-expect-error "isJoi" is an untyped property in Joi
export const Joi = findByProps("isJoi") as typeof import("joi");

export const Reanimated = findByProps(
    "useSharedValue",
) as typeof import("react-native-reanimated");

export const FlashList = findByProps("FlashList")
    .FlashList as typeof import("@shopify/flash-list").FlashList;

export const zustand = findByProps(
    "create",
    "useStore",
) as typeof import("zustand");

export const DocumentPicker = findByProps(
    "pickSingle",
    "isCancel",
) as typeof import("react-native-document-picker");

//
// raw native modules
//
export const RNCacheModule = (RN.NativeModules.MMKVManager ??
    RN.NativeModules.NativeCacheModule) as StateStorage;

export const RNChatModule = (RN.NativeModules.DCDChatManager ??
    RN.NativeModules.NativeChatModule) as {
    updateRows: (id: string, json: string) => any;
};

export const RNFileModule = (RN.NativeModules.DCDFileManager ??
    RN.NativeModules.NativeFileModule) as {
    readFile(path: string, encoding: "base64" | "utf8"): Promise<string>;
    fileExists(path: string): Promise<boolean>;
    removeFile(
        storageDir: "documents" | "cache",
        path: string,
    ): Promise<boolean>;
    writeFile(
        storageDir: "cache" | "documents",
        path: string,
        data: string,
        encoding: "base64" | "utf8",
    ): Promise<string>;

    clearFolder(
        storageDir: "documents" | "cache",
        path: string,
    ): Promise<boolean>;
    saveFileToGallery(
        uri: `file://${string}`,
        fileName: string,
        fileType: "PNG" | "JPEG",
    ): Promise<string>;
    readAsset(path: string, encoding: "base64" | "utf8"): void;
    getSize(uri: string): Promise<boolean>;

    /** Doesn't end with / */
    CacheDirPath: string;
    /** Doesn't end with / */
    DocumentsDirPath: string;
    getConstants: () => {
        /** Doesn't end with / */
        CacheDirPath: string;
        /** Doesn't end with / */
        DocumentsDirPath: string;
    };
};
