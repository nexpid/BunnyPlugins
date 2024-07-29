import { plugin } from "@vendetta";
import { manifest } from "@vendetta/plugin";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { patchSettingsPin } from "$/lib/pinToSettings";

import { lang, vstorage } from "..";
import Settings from "../components/Settings";
import SettingsSection from "../components/SettingsSection";
import { unsubAuthStore } from "../stores/AuthorizationStore";
import { unsubCacheStore } from "../stores/CacheStore";

export default (): (() => void) => {
    const patches = new Array<any>();
    patches.push(
        patchSettingsPin(
            () => vstorage.config.addToSettings,
            () => <SettingsSection />,
            {
                key: plugin.manifest.name,
                icon: getAssetIDByName(manifest.vendetta?.icon ?? ""),
                title: () => lang.format("plugin.name", {}),
                page: {
                    render: Settings,
                },
            },
        ),
    );
    patches.push(unsubAuthStore);
    patches.push(unsubCacheStore);

    return () => {
        patches.forEach(x => x());
    };
};
