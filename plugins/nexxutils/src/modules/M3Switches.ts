import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Module, ModuleCategory } from "../stuff/Module";
import { after } from "@vendetta/patcher";
import { ReactNative as RN } from "@vendetta/metro/common";
import CustomSwitch from "../components/modules/M3Switches/CustomSwitch";

export default new Module({
  id: "m3-switches",
  label: "M3 Switches",
  sublabel: "Changes the default Discord switches to M3 switches",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("img_nitro_remixing"),
  runner: {
    onStart() {
      this.patches.add(
        after("render", RN.Switch, ([x], ret) =>
          React.createElement(
            CustomSwitch,
            Object.assign(x, {
              slot: ret,
            })
          )
        )
      );
    },
    onStop() {},
  },
});
