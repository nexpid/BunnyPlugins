import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Module, ModuleCategory } from "../stuff/Module";
import { after, before, instead } from "@vendetta/patcher";
import { ReactNative as RN } from "@vendetta/metro/common";
import CustomSwitch from "../components/modules/BetterComponents/M3Switch";
import { find, findByDisplayName, findByName } from "@vendetta/metro";
import CustomToast from "../components/modules/BetterComponents/M3Snackbar";
import { showToast } from "@vendetta/ui/toasts";
import { assets } from "@vendetta/ui";
import CustomDialog from "../components/modules/BetterComponents/M3Dialog";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { article } from "../stuff/util";

const { FormSwitch } = find(
  (x) => typeof x?.FormSwitch === "function" && !("FormRow" in x)
);
const Toast = findByName("Toast", false);
const Alert = findByDisplayName("FluxContainer(Alert)");

function componentify<T extends "before" | "after" | "instead">(
  self: Module<any>,
  should: boolean,
  origin: any,
  property: string,
  replacer: T,
  callback: T extends "before"
    ? Parameters<typeof before>[2]
    : T extends "after"
    ? Parameters<typeof after>[2]
    : Parameters<typeof instead>[2]
) {
  const fnc =
    replacer === "before" ? before : replacer === "after" ? after : instead;

  if (should)
    self.patches.add(
      //@ts-ignore
      fnc(property, origin, callback)
    );
}

export default new Module({
  id: "better-components",
  label: "Better Components",
  sublabel:
    "Changes some Discord UI components to their M3 variants (and more!)",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("img_nitro_remixing"),
  settings: {
    switch: {
      label: "Switch",
      subLabel(value) {
        return value === "Default"
          ? "Does not modify switches"
          : `Replaces switches with ${article(value)} ${value} variation`;
      },
      type: "choose",
      choices: ["Default", "M3", "Tabs v2"],
      default: "M3",
    },
    toast: {
      label: "Toast",
      subLabel(value) {
        return value === "Default"
          ? "Does not modify toasts"
          : `Replaces toasts with ${article(value)} ${value} variation`;
      },
      type: "choose",
      choices: ["Default", "M3"],
      default: "M3",
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
    alert: {
      label: "Alert",
      subLabel(value) {
        return value === "Default"
          ? "Does not modify alerts"
          : `Replaces alerts with ${article(value)} ${value} variation`;
      },
      type: "choose",
      choices: ["Default", "M3"],
      default: "M3",
    },
    test_alert: {
      label: "Show Test Alert",
      type: "button",
      action() {
        showConfirmationAlert({
          title: "Hello world!",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean elit mauris, maximus vitae rutrum et, pulvinar ac neque. Aenean nisi justo, fermentum egestas luctus a, faucibus ac orci.",
          confirmText: "K",
          onConfirm: () =>
            new Promise((res) => {
              setTimeout(res, 5000);
            }),
          cancelText: "Ok",
          secondaryConfirmText: "Okay",
        });
      },
    },
  },
  handlers: {
    onStart() {
      componentify(
        this,
        this.storage.options.switch === "M3",
        RN.Switch,
        "render",
        "after",
        ([x]) => React.createElement(CustomSwitch, x)
      );
      componentify(
        this,
        this.storage.options.switch === "Tabs v2",
        RN.Switch,
        "render",
        "after",
        ([x]) => React.createElement(FormSwitch, x)
      );

      componentify(
        this,
        this.storage.options.toast === "M3",
        Toast,
        "default",
        "after",
        ([x]) => React.createElement(CustomToast, x)
      );
      componentify(
        this,
        this.storage.options.alert === "M3",
        Alert.prototype,
        "render",
        "after",
        (_, ret) => React.createElement(CustomDialog, ret.props)
      );
    },
    onStop() {},
  },
});
