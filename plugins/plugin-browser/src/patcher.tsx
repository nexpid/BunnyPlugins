import { findByName, findByProps } from "@vendetta/metro";
import { i18n } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import SettingsSection from "../components/SettingsSection";
import { PluginsFullJson } from "./types";
import { Forms } from "@vendetta/ui/components";

const { FormSection } = Forms;
const settingsModule = findByName("UserSettingsOverviewWrapper", false);

function getCircularReplacer() {
  const ancestors = [];
  return function (key, value) {
    if (typeof value !== "object" || value === null) {
      return value;
    }
    // `this` is the object that value is contained in,
    // i.e., its direct parent.
    while (ancestors.length > 0 && ancestors.at(-1) !== this) {
      ancestors.pop();
    }
    if (ancestors.includes(value)) {
      return "[Circular]";
    }
    ancestors.push(value);
    return value;
  };
}

export default (): (() => void) => {
  let patches = [];
  let thisShouldUnpatchAutomatically = after(
    "default",
    settingsModule,
    (_, ret) => {
      thisShouldUnpatchAutomatically();

      const Overview = findInReactTree(
        ret.props.children,
        (i) => i.type && i.type.name === "UserSettingsOverview"
      );

      patches.push(
        after(
          "render",
          Overview.type.prototype,
          (_, { props: { children } }) => {
            const titles = [
              i18n.Messages["BILLING_SETTINGS"],
              i18n.Messages["PREMIUM_SETTINGS"],
            ];
            children = findInReactTree(
              children,
              (t) => t.children[1].type === FormSection
            ).children;
            const index = children.findIndex((c) =>
              titles.includes(c?.props.label)
            );

            children.splice(index === -1 ? 4 : index, 0, <SettingsSection />);
          }
        )
      );
    },
    true
  );

  return () => patches.forEach((x) => x());
};
