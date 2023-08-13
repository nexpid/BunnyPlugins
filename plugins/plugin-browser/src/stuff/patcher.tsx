import SettingsSection from "../components/SettingsSection";
import { patchSettingsPin } from "../../../../stuff/pinToSettings";
import { plugin } from "@vendetta";
import { getAssetIDByName } from "@vendetta/ui/assets";
import PluginBrowserPage from "../components/pages/PluginBrowserPage";
import { getChanges, initThing } from "./pluginChecker";

export let pluginsEmitter: Emitter;

export default (): (() => void) => {
  let patches = [];
  patches.push(
    patchSettingsPin(
      () => true,
      () => (
        <SettingsSection
          changes={getChanges().filter((x) => x[1] === "new").length}
        />
      ),
      {
        key: plugin.manifest.name,
        icon: getAssetIDByName("ic_search_items_24px"),
        title: () => {
          const changes = getChanges().filter((x) => x[1] === "new").length;
          return `Plugin Browser${changes ? ` (+${changes})` : ""}`;
        },
        page: {
          render: PluginBrowserPage,
        },
      }
    )
  );
  patches.push(initThing());

  return () => patches.forEach((x) => x());
};
