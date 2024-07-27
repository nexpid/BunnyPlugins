import { storage } from "@vendetta/plugin";

import Settings from "./components/Settings";
import patcher from "./stuff/patcher";

export const vstorage = storage as {
    buttonType: string;
    previewType: string;
};

let unpatch;
export default {
    onLoad: () => {
        vstorage.buttonType ??= "pill";
        vstorage.previewType ??= "popup";
        unpatch = patcher();
    },
    onUnload: () => unpatch?.(),
    settings: Settings,
};
