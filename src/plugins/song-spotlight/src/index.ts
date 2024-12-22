import { storage } from "@vendetta/plugin";

import { Lang } from "$/lang";

import settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage = storage as {
    custom: {
        host: string;
        clientId: string;
    };
};

export const initState = {
    inits: [] as string[],
};

export const lang = new Lang("song_spotlight");
const patches = new Array<any>();
export default {
    onLoad: () => {
        vstorage.custom ??= {
            host: "",
            clientId: "",
        };

        patches.push(patcher());
    },
    onUnload: () => {
        patches.forEach(x => x());
    },
    settings,
};
