import { logger } from "@vendetta";
import { id } from "@vendetta/plugin";
import { stopPlugin } from "@vendetta/plugins";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { Lang } from "$/lang";

import patcher from "./stuff/patcher";

export const dataURL = "https://userpfp.github.io/UserPFP/source/data.json";
export const staticGifURL = (url: string) =>
    `https://static-gif.nexpid.workers.dev/convert.gif?url=${encodeURIComponent(
        url,
    )}&_=${hash}`;

export let enabled = false;
export let hash: string;

export const lang = new Lang("usrpfp");

let unpatch: () => void;
export default {
    onLoad: async () => {
        hash = Array.from(crypto.getRandomValues(new Uint8Array(20)))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
        enabled = true;
        try {
            unpatch = await patcher();
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            logger.error(`${lang.format("log.patch_error", {})}\n${err.stack}`);

            showToast(
                lang.format("toast.patch_error", {}),
                getAssetIDByName("CircleXIcon"),
            );
            stopPlugin(id);
        }
    },
    onUnload: () => {
        enabled = false;
        lang.unload();
        unpatch();
    },
};
