import { plugin } from "@vendetta";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { patchSettingsPin } from "$/lib/pinToSettings";

import { lang, vstorage } from "..";
import Settings from "../components/Settings";
import SettingsSection from "../components/SettingsSection";

export default (): (() => void) => {
  const patches = [];
  patches.push(
    patchSettingsPin(
      () => vstorage.addToSettings,
      () => <SettingsSection />,
      {
        key: plugin.manifest.name,
        icon: getAssetIDByName("ic_contact_sync"),
        get title() {
          return lang.format("plugin.name", {});
        },
        page: {
          get title() {
            return lang.format("plugin.name", {});
          },
          render: Settings,
        },
      },
    ),
  );

  return () => patches.forEach((x) => x());
};
