import { ReactNative as RN } from "@vendetta/metro/common";

const FileManager = (window.nativeModuleProxy.DCDFileManager ??
  window.nativeModuleProxy.RTNFileManager)!;

export const downloadSource =
  "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/doom/assets/download/";

export const toDownloadPrefix = "vendetta/doomPlugin/";
export const toDownload = [
  "doom.jsdos",
  "js-dos.css",
  "js-dos.js",
  "wdosbox.js",
  "wdosbox.wasm",
];
export const toDownloadMimes = [
  "application/zip",
  "text/css",
  "text/javascript",
  "text/javascript",
  "application/octet-stream",
];

export type ToDownloadContent = {
  [k in (typeof toDownload)[number]]: string;
};

export async function existsFile(fileName: string) {
  return await FileManager.fileExists(
    `${FileManager.getConstants().DocumentsDirPath}/${
      toDownloadPrefix + fileName
    }`
  );
}
export async function saveFile(fileName: string, data: string) {
  fileName = toDownloadPrefix + fileName;
  return await FileManager.writeFile(
    "documents",
    RN.Platform.select({
      default: fileName,
      ios: FileManager.saveFileToGallery ? fileName : `Documents/${fileName}`,
    }),
    data,
    "utf8"
  );
}
export async function readFile(fileName: string) {
  return await FileManager.readFile(
    `${FileManager.getConstants().DocumentsDirPath}/${
      toDownloadPrefix + fileName
    }`,
    "utf8"
  );
}
