import { plugin } from "@vendetta";
import { React } from "@vendetta/metro/common";
import { manifest } from "@vendetta/plugin";
import { getAssetIDByName } from "@vendetta/ui/assets";

import TextBadge from "$/components/TextBadge";
import { patchSettingsPin } from "$/lib/pinToSettings";

import { lang } from "..";
import PluginBrowserPage from "../components/pages/PluginBrowserPage";
import SettingsSection from "../components/SettingsSection";
import { getChanges, initThing } from "./pluginChecker";

export let pluginsEmitter: Emitter;

export default (): (() => void) => {
    const patches = new Array<any>();
    patches.push(
        patchSettingsPin(
            () => true,
            () => (
                <SettingsSection changes={Object.keys(getChanges()).length} />
            ),
            {
                key: plugin.manifest.name,
                icon: getAssetIDByName(manifest.vendetta?.icon ?? ""),
                trailing: () => {
                    const changes = React.useRef(
                        Object.keys(getChanges()).length,
                    ).current;
                    if (changes > 0)
                        return (
                            <TextBadge variant="danger">{changes}</TextBadge>
                        );
                },
                title: () => lang.format("plugin.name", {}),
                page: {
                    render: PluginBrowserPage,
                },
            },
        ),
    );
    patches.push(initThing());
    patches.push(lang.unload);

    return () => {
        patches.forEach(x => x());
    };
};
