import { findByName, findByProps } from "@vendetta/metro";
import {
  ReactNative as RN,
  React,
  i18n,
  lodash,
  stylesheet,
} from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";
import { ErrorBoundary, Forms } from "@vendetta/ui/components";
import { findInReactTree, without } from "@vendetta/utils";

const { FormSection } = Forms;

const getScreens = findByName("getScreens");
const settingsModule = findByName("UserSettingsOverviewWrapper", false);
const settingsYouScreen = findByName("SettingsOverviewScreen", false);
const stuff = findByProps("SETTING_RELATIONSHIPS", "SETTING_RENDERER_CONFIGS");

const titleConfig = findByProps("getSettingTitleConfig");

const styles = stylesheet.createThemedStyleSheet({
  container: {
    flex: 1,
    backgroundColor: semanticColors.BACKGROUND_MOBILE_PRIMARY,
  },
});

export function patchSettingsPin(
  shouldAppear: () => boolean,
  render: () => React.JSX.Element,
  you?: {
    key: string;
    icon?: number;
    title: string | (() => string);
    page: {
      render: React.ComponentType;
      noErrorBoundary?: boolean;
      title?: string;
      headerRight?: () => void;
    };
  }
): () => void {
  const patches = [];

  const unpatch = after(
    "default",
    settingsModule,
    (_, ret) => {
      unpatch();

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
            const index = children.findIndex((c: any) =>
              titles.includes(c?.props.label)
            );

            if (shouldAppear())
              children.splice(index === -1 ? 4 : index, 0, render());
          }
        )
      );
    },
    true
  );
  patches.push(unpatch);

  if (getScreens && you) {
    const screenKey = `VENDETTA_PLUGIN_${lodash
      .snakeCase(you.key)
      .toUpperCase()}`;

    patches.push(
      after("default", settingsYouScreen, (_, ret) => {
        const sec = ret.props.sections;
        const ind = sec.findIndex((x) => x.title === "Vendetta");
        if (sec[ind] && shouldAppear()) {
          const clone = { ...sec[ind] };
          clone.settings = [...clone.settings, screenKey];
          sec[ind] = clone;
        }
      })
    );

    patches.push(
      after("getSettingTitleConfig", titleConfig, (_, ret) => ({
        ...ret,
        ...Object.fromEntries([
          [
            screenKey,
            typeof you.title === "function" ? you.title() : you.title,
          ],
        ]),
      }))
    );

    const Page = you.page.render;
    const component = React.memo(({ navigation }: any) => {
      const unsub = navigation.addListener("focus", () => {
        unsub();
        navigation.setOptions(without(you.page, "noErrorBoundary", "render"));
      });

      return (
        <RN.View style={styles.container}>
          {you.page.noErrorBoundary ? (
            <Page />
          ) : (
            <ErrorBoundary>
              <Page />
            </ErrorBoundary>
          )}
        </RN.View>
      );
    });

    const old = stuff.SETTING_RELATIONSHIPS;
    stuff.SETTING_RELATIONSHIPS = {
      ...old,
      ...Object.fromEntries([[screenKey, null]]),
    };
    const oldZ = stuff.SETTING_RENDERER_CONFIGS;
    stuff.SETTING_RENDERER_CONFIGS = {
      ...oldZ,
      ...Object.fromEntries([
        [
          screenKey,
          {
            type: "route",
            icon: you.icon,
            screen: {
              route: `VendettaPlugin${lodash
                .chain(you.key)
                .camelCase()
                .upperFirst()
                .value()}`,
              getComponent: () => component,
            },
          },
        ],
      ]),
    };

    patches.push(() => {
      stuff.SETTING_RELATIONSHIPS = old;
      stuff.SETTING_RENDERER_CONFIGS = oldZ;
    });
  }

  return () => patches.forEach((x) => x());
}
