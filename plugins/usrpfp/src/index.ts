import { logger } from "@vendetta";
import { id } from "@vendetta/plugin";
import { stopPlugin } from "@vendetta/plugins";

import patcher from "./stuff/patcher";

export const dataURL = "https://userpfp.github.io/UserPFP/source/data.json";
export const staticGifURL = (url: string) =>
  `https://static-gif.nexpid.workers.dev/convert.gif?url=${encodeURIComponent(
    url,
  )}&_=${hash}`;

export let enabled = false;
export let hash: string;

let unpatch: () => void;
export default {
  onLoad: async () => {
    hash = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    enabled = true;
    try {
      unpatch = await patcher();
    } catch (e) {
      logger.error(`Errored while patching!\n${e.stack}`);
      stopPlugin(id);
    }
  },
  onUnload: () => {
    enabled = false;
    unpatch?.();
  },
};
