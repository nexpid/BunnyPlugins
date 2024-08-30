import { React } from "@vendetta/metro/common";

import { patchPanelUI } from "./panel";
import { patchTabsUI } from "./tabs";

export interface PinToSettingsTabs {
    key: string;
    title: () => string;
    icon?: number;
    predicate?: () => boolean;
    trailing?: () => React.ReactNode;
    page: React.ComponentType;
}

export function patchSettingsPin(tabs: PinToSettingsTabs): () => void {
    const patches = new Array<() => void>();

    const realPredicate = tabs.predicate;
    let disable: () => void;

    tabs.predicate = () => {
        const val = realPredicate?.() ?? true;
        const [disabled, setDisabled] = React.useState(false);
        disable = () => setDisabled(true);

        return disabled ? false : val;
    };

    patchPanelUI(tabs, patches);
    patchTabsUI(tabs, patches);
    patches.push(() => disable());

    return () => patches.forEach(x => x());
}
