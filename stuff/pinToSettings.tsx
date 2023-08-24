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

//! Changed in 194204 lol
const OLD_stuffFunc = ["SETTING_RELATIONSHIPS", "SETTING_RENDERER_CONFIGS"];
const NEW_stuffFunc = ["SETTING_RENDERER_CONFIG"];
const oldStuff = findByProps(...OLD_stuffFunc);
const newStuff = findByProps(...NEW_stuffFunc);

const OLD_titleConfigFunc = "getSettingTitleConfig";
const NEW_titleConfigFunc = "getSettingTitles";
const oldTitleConfig = findByProps(OLD_titleConfigFunc);
const titleConfigFunc = oldTitleConfig
  ? OLD_titleConfigFunc
  : NEW_titleConfigFunc;
const titleConfig = oldTitleConfig ?? findByProps(NEW_titleConfigFunc);

const styles = stylesheet.createThemedStyleSheet({
  container: {
    flex: 1,
    backgroundColor: semanticColors.BACKGROUND_MOBILE_PRIMARY,
  },
});

export function patchSettingsPin(
  shouldAppear: () => boolean,
  render: React.FunctionComponent,
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
              children.splice(index === -1 ? 4 : index, 0, render({}));
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
      after(titleConfigFunc, titleConfig, (_, ret) => ({
        ...ret,
        ...{
          [screenKey]:
            typeof you.title === "function" ? you.title() : you.title,
        },
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

    const rendererConfig = {
      [screenKey]: {
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
    };

    //! DEBUGGING REQUIRED!
    //  The code below was not tested and may not even work
    // TODO Testing required

    if (oldStuff) {
      const old = oldStuff.SETTING_RELATIONSHIPS;
      oldStuff.SETTING_RELATIONSHIPS = {
        ...old,
        ...{ [screenKey]: null },
      };
      const oldZ = oldStuff.SETTING_RENDERER_CONFIGS;
      oldStuff.SETTING_RENDERER_CONFIGS = {
        ...oldZ,
        ...rendererConfig,
      };

      patches.push(() => {
        oldStuff.SETTING_RELATIONSHIPS = old;
        oldStuff.SETTING_RENDERER_CONFIGS = oldZ;
      });
    } else {
      const old = newStuff.SETTING_RENDERER_CONFIG;
      newStuff.SETTING_RENDERER_CONFIG = { ...old, ...rendererConfig };

      patches.push(() => {
        newStuff.SETTING_RENDERER_CONFIG;
      });
    }
  }

  return () => patches.forEach((x) => x());
}
