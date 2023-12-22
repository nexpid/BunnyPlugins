import { plugin } from "@vendetta";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { patchSettingsPin } from "../../../../stuff/pinToSettings";
import { vstorage } from "..";
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
        title: "Cloud Sync",
        page: {
          title: "CloudSync",
          render: Settings,
        },
      },
    ),
  );

  return () => patches.forEach((x) => x());
};
