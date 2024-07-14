import { storage } from "@vendetta/plugin";

import { Lang } from "$/lang";

import Settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage = storage as {
  guilds: string[];
  folders: string[];
};

export const lang = new Lang("hide_servers");

let unpatch: () => void;
export default {
  onLoad: () => {
    vstorage.guilds ??= [];
    vstorage.folders ??= [];

    unpatch = patcher();
  },
  onUnload: () => unpatch?.(),
  settings: Settings,
};
