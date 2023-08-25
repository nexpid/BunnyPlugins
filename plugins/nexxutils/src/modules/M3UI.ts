import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Module, ModuleCategory } from "../stuff/Module";
import { after } from "@vendetta/patcher";
import { ReactNative as RN } from "@vendetta/metro/common";
import CustomSwitch from "../components/modules/M3UI/M3Switch";
import { findByName } from "@vendetta/metro";
import CustomToast from "../components/modules/M3UI/M3Snackbar";

const Toast = findByName("Toast", false);

export default new Module({
  id: "m3-ui",
  label: "M3 UI",
  sublabel: "Changes some Discord UI components to their M3 variants",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("img_nitro_remixing"),
  settings: {
    switch: {
      label: "M3 Switch",
      type: "toggle",
      default: true,
    },
    snackbar: {
      label: "M3 Snackbar",
      type: "toggle",
      default: true,
    },
  },
  handlers: {
    onStart() {
      if (this.storage.options.switch)
        this.patches.add(
          after("render", RN.Switch, ([x]) =>
            React.createElement(CustomSwitch, x)
          )
        );
      if (this.storage.options.snackbar)
        this.patches.add(
          after("default", Toast, ([x]) => React.createElement(CustomToast, x))
        );
    },
    onStop() {},
  },
});
