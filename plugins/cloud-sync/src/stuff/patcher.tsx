import SettingsSection from "../components/SettingsSection";
import { patchSettingsPin } from "../../../../stuff/pinToSettings";
import { plugin } from "@vendetta";
import { getAssetIDByName } from "@vendetta/ui/assets";
import Settings from "../components/Settings";
import { vstorage } from "..";

export default (): (() => void) => {
  let patches = [];
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
      }
    )
  );

  return () => patches.forEach((x) => x());
};
