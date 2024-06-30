import { find, findByName, findByProps } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";
import { type StateStorage } from "zustand/middleware";

//
// JS deps
//
export const WebView = find((x) => x?.WebView && !x.default)
  .WebView as typeof import("react-native-webview").default;

export const Svg = findByProps("SvgXml") as typeof import("react-native-svg");

//@ts-expect-error "isJoi" is an untyped property in Joi
export const Joi = findByProps("isJoi") as typeof import("joi");

export const Reanimated = findByProps(
  "useSharedValue",
) as typeof import("react-native-reanimated");

export const FlashList = findByProps("FlashList")
  .FlashList as typeof import("@shopify/flash-list").FlashList;

export const zustand = {
  create: findByName("create") as typeof import("zustand").create,
};

export const RNMMKVManager = RN.NativeModules.MMKVManager as StateStorage;

//
// raw native modules
//
export const RNFileManager = (RN.NativeModules.DCDFileManager ??
  RN.NativeModules.RTNFileManager) as {
  /**
   * @param path **Full** path to file
   */
  fileExists: (path: string) => Promise<boolean>;
  /**
   * Allowed URI schemes on Android: `file://`, `content://` ([See here](https://developer.android.com/reference/android/content/ContentResolver#accepts-the-following-uri-schemes:_3))
   */
  getSize: (uri: string) => Promise<boolean>;
  /**
   * @param path **Full** path to file
   * @param encoding Set to `base64` in order to encode response
   */
  readFile(path: string, encoding: "base64" | "utf8"): Promise<string>;
  saveFileToGallery?(
    uri: string,
    fileName: string,
    fileType: "PNG" | "JPEG",
  ): Promise<string>;
  /**
   * Beware! This function has differing functionality on iOS and Android.
   * @param storageDir Either `cache` or `documents`.
   * @param path Path in `storageDir`, parents are recursively created.
   * @param data The data to write to the file
   * @param encoding Set to `base64` if `data` is base64 encoded.
   * @returns Promise that resolves to path of the file once it got written
   */
  writeFile(
    storageDir: "cache" | "documents",
    path: string,
    data: string,
    encoding: "base64" | "utf8",
  ): Promise<string>;
  removeFile(storageDir: "cache" | "documents", path: string): Promise<unknown>;
  getConstants: () => {
    /**
     * The path the `documents` storage dir (see {@link writeFile}) represents.
     */
    DocumentsDirPath: string;
    CacheDirPath: string;
  };
  /**
   * Will apparently cease to exist some time in the future so please use {@link getConstants} instead.
   * @deprecated
   */
  DocumentsDirPath: string;
};

// TODO finish types for RNBundleUpdaterManager
export const RNBundleUpdaterManager = RN.NativeModules.BundleUpdaterManager as {
  reload: () => void;
};

export const RNSoundManager = RN.NativeModules.DCDSoundManager as {
  pause: (soundId: number) => void;
  play: (soundId: number) => void;
  stop: (soundId: number) => void;
  prepare: (
    url: string,
    type: "notification",
    soundId: number,
    callback: (
      error: any,
      meta: { numberOfChannels: number; duration: number },
    ) => any,
  ) => void;
};

export const RNFSManager = RN.NativeModules.RNFSManager;
