import { findByName, findByProps } from "@vendetta/metro";
import {
  i18n,
  lodash,
  React,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { after, before } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";
import { ErrorBoundary, Forms } from "@vendetta/ui/components";
import { findInReactTree, without } from "@vendetta/utils";

const { FormSection } = Forms;

const getScreens = findByName("getScreens");
const settingsModule = findByName("UserSettingsOverviewWrapper", false);

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
    title: string;
    page: {
      render: React.ComponentType;
      noErrorBoundary?: boolean;
      title?: string;
      headerRight?: () => void;
    };
  },
): () => void {
  const patches = [];

  const unpatch = after(
    "default",
    settingsModule,
    (_, ret) => {
      unpatch();

      const Overview = findInReactTree(
        ret.props.children,
        (i) => i.type && i.type.name === "UserSettingsOverview",
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
              (t) => t.children[1].type === FormSection,
            ).children;
            const index = children.findIndex((c: any) =>
              titles.includes(c?.props.label),
            );

            if (shouldAppear())
              children.splice(index === -1 ? 4 : index, 0, render({}));
          },
        ),
      );
    },
    true,
  );
  patches.push(unpatch);

  if (getScreens && you) {
    const screenKey = `VENDETTA_PLUGIN_${lodash
      .snakeCase(you.key)
      .toUpperCase()}`;

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
        title: () => you.title,
        icon: you.icon,
        parent: null,
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

    const manipulateSections = (ret: any, nw?: boolean) => {
      const cloned = [...ret];
      const sections = nw ? cloned?.[0]?.sections : cloned;
      if (!Array.isArray(sections)) return sections;

      const title = "Vendetta";
      const section = sections.find(
        (x) => x?.title === title || x?.label === title,
      );
      if (section && !section?.settings?.includes(screenKey))
        section.settings.push(screenKey);

      return cloned;
    };

    const oldYouPatch = () => {
      const layout = findByProps("useOverviewSettings");
      const titleConfig = findByProps("getSettingTitleConfig");
      const stuff = findByProps(
        "SETTING_RELATIONSHIPS",
        "SETTING_RENDERER_CONFIGS",
      );

      const OLD_getterFunction = "getSettingSearchListItems";
      const NEW_getterFunction = "getSettingListItems";
      const oldGettersModule = findByProps(OLD_getterFunction);
      const usingNewGettersModule = !oldGettersModule;
      const getterFunctionName = usingNewGettersModule
        ? NEW_getterFunction
        : OLD_getterFunction;
      const getters = oldGettersModule ?? findByProps(NEW_getterFunction);

      if (!getters || !layout) return false;

      patches.push(
        after("useOverviewSettings", layout, (_, ret) =>
          manipulateSections(ret),
        ),
      );
      patches.push(
        after("getSettingTitleConfig", titleConfig, (_, ret) => ({
          ...ret,
          [screenKey]: you.title,
        })),
      );
      patches.push(
        after(getterFunctionName, getters, ([settings], ret) => [
          ...(settings.includes(screenKey)
            ? [
                {
                  type: "setting_search_result",
                  ancestorRendererData: rendererConfig[screenKey],
                  setting: screenKey,
                  title: () => you.title,
                  breadcrumbs: ["Vendetta"],
                  icon: rendererConfig[screenKey].icon,
                },
              ]
            : []),
          ...ret,
        ]),
      );

      const oldRelationships = stuff.SETTING_RELATIONSHIPS;
      const oldRendererConfigs = stuff.SETTING_RENDERER_CONFIGS;

      stuff.SETTING_RELATIONSHIPS = {
        ...oldRelationships,
        [screenKey]: null,
      };
      stuff.SETTING_RENDERER_CONFIGS = {
        ...oldRendererConfigs,
        ...rendererConfig,
      };

      patches.push(() => {
        stuff.SETTING_RELATIONSHIPS = oldRelationships;
        stuff.SETTING_RENDERER_CONFIGS = oldRelationships;
      });

      return true;
    };

    const newYouPatch = () => {
      const settingsListComponents = findByProps("SearchableSettingsList");
      const settingConstantsModule = findByProps("SETTING_RENDERER_CONFIG");
      const gettersModule = findByProps("getSettingListItems");

      if (!gettersModule || !settingsListComponents || !settingConstantsModule)
        return false;

      patches.push(
        before("type", settingsListComponents.SearchableSettingsList, (ret) =>
          manipulateSections(ret, true),
        ),
      );

      patches.push(
        after("getSettingListSearchResultItems", gettersModule, (_, ret) => {
          for (const s of ret)
            if (s.setting === screenKey) s.breadcrumbs = ["Vendetta"];
        }),
      );

      const oldRendererConfig = settingConstantsModule.SETTING_RENDERER_CONFIG;
      settingConstantsModule.SETTING_RENDERER_CONFIG = {
        ...oldRendererConfig,
        ...rendererConfig,
      };

      patches.push(() => {
        settingConstantsModule.SETTING_RENDERER_CONFIG = oldRendererConfig;
      });

      return true;
    };

    if (!newYouPatch()) oldYouPatch();
  }

  return () => patches.forEach((x) => x());
}
