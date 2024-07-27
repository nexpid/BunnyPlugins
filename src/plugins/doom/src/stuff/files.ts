import RNFS from "$/wrappers/RNFS";

export const downloadSource =
    "https://raw.githubusercontent.com/nexpid/VendettaDOOM/main/";
export const storePrefix = "vendetta/DOOM/";

export function existsFile(fileName: string) {
    return RNFS.exists(
        `${RNFS.DocumentDirectoryPath}/${storePrefix + fileName}`,
    );
}
export async function saveFile(
    fileName: string,
    data: string,
    encoding: "utf8" | "base64" = "utf8",
) {
    const dir = (storePrefix + fileName).split("/").slice(0, -1).join("/");
    if (RNFS.hasRNFS) await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/${dir}`);
    await RNFS.writeFile(
        `${RNFS.DocumentDirectoryPath}/${storePrefix + fileName}`,
        data,
        encoding,
    );
}
export async function readFile(
    fileName: string,
    encoding: "utf8" | "base64" = "utf8",
) {
    const dir = (storePrefix + fileName).split("/").slice(0, -1).join("/");
    if (RNFS.hasRNFS) await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/${dir}`);
    return await RNFS.readFile(
        `${RNFS.DocumentDirectoryPath}/${storePrefix + fileName}`,
        encoding,
    );
}
export function purgeFiles() {
    return RNFS.unlink(`${RNFS.DocumentDirectoryPath}/${storePrefix}`);
}
