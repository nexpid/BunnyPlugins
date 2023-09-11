import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Module, ModuleCategory } from "../stuff/Module";
import { after } from "@vendetta/patcher";
import { ReactNative as RN } from "@vendetta/metro/common";
import CustomSwitch from "../components/modules/M3UI/M3Switch";
import { find, findByDisplayName, findByName } from "@vendetta/metro";
import CustomToast from "../components/modules/M3UI/M3Snackbar";
import { showToast } from "@vendetta/ui/toasts";
import { assets } from "@vendetta/ui";
import CustomDialog from "../components/modules/M3UI/M3Dialog";
import { showConfirmationAlert } from "@vendetta/ui/alerts";

const { FormSwitch } = find(
  (x) => typeof x?.FormSwitch === "function" && !("FormRow" in x)
);
const Toast = findByName("Toast", false);
const Alert = findByDisplayName("FluxContainer(Alert)");

export default new Module({
  id: "m3-ui",
  label: "M3 UI",
  sublabel: "Changes some Discord UI components to their M3 variants",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("img_nitro_remixing"),
  settings: {
    switch: {
      label: "M3 Switch",
      type: "choose",
      choices: ["Disabled", "Custom", "Tabs v2"],
      default: "Custom",
    },
    snackbar: {
      label: "M3 Snackbar",
      type: "toggle",
      default: true,
    },
    test_toast: {
      label: "Show Test Toast",
      type: "button",
      action() {
        const list = Object.values(assets.all);
        const item = list[Math.floor(Math.random() * list.length)];
        showToast(item.name, item.id);
      },
    },
    dialog: {
      label: "M3 Dialog",
      type: "toggle",
      default: true,
    },
    test_alert: {
      label: "Show Test Alert",
      type: "button",
      action() {
        showConfirmationAlert({
          title: "Hello world!",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean elit mauris, maximus vitae rutrum et, pulvinar ac neque. Aenean nisi justo, fermentum egestas luctus a, faucibus ac orci. Nam varius metus a arcu commodo, sit amet ullamcorper tellus ornare. Phasellus nec nunc neque. Morbi non ex vel tortor varius auctor. Morbi finibus, velit eu consequat consequat, diam orci volutpat ipsum, ut fringilla risus risus non elit. Morbi nunc elit, convallis vitae molestie vitae, porttitor eget eros. Pellentesque eget quam vitae nisi cursus hendrerit. Aliquam erat volutpat. Nam quis vestibulum justo.",
          confirmText: "K",
          onConfirm: () => void 0,
          cancelText: "Ok",
          secondaryConfirmText: "Okay",
        });
      },
    },
  },
  handlers: {
    onStart() {
      if (this.storage.options.switch === "Custom")
        this.patches.add(
          after("render", RN.Switch, ([x]) =>
            React.createElement(CustomSwitch, x)
          )
        );
      else if (this.storage.options.switch === "Tabs v2")
        this.patches.add(
          after("render", RN.Switch, ([x]) =>
            React.createElement(FormSwitch, x)
          )
        );

      if (this.storage.options.snackbar)
        this.patches.add(
          after("default", Toast, ([x]) => React.createElement(CustomToast, x))
        );
      if (this.storage.options.dialog)
        this.patches.add(
          after("render", Alert.prototype, (_, ret) =>
            React.createElement(CustomDialog, ret.props)
          )
        );
    },
    onStop() {},
  },
});
