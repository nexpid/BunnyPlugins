import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { plugins } from "@vendetta/plugins";
import { themes } from "@vendetta/themes";
import { semanticColors } from "@vendetta/ui";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";

import RedesignButton from "$/components/compat/RedesignButton";
import SimpleText from "$/components/SimpleText";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  hideActionSheet,
  openSheet,
} from "$/types";

import { cache, canImport, isPluginProxied } from "../..";
import { importData, SyncImportOptions } from "../../stuff/syncStuff";
import { DBSave } from "../../types/api/latest";
import { openImportLogsPage } from "../pages/ImportLogsPage";

const { View } = General;
const { FormCheckboxRow } = Forms;

export default function ImportActionSheet({
  defOptions,
  save = cache.save,
  navigation,
}: {
  defOptions?: SyncImportOptions;
  save?: DBSave.Save;
  navigation: any;
}) {
  const has = {
    unproxiedPlugins: save.sync.plugins.filter(
      (x) => !plugins[x.id] && !isPluginProxied(x.id) && canImport(x.id),
    ).length,
    plugins: save.sync.plugins.filter(
      (x) => !plugins[x.id] && isPluginProxied(x.id) && canImport(x.id),
    ).length,
    themes: save.sync.themes.filter((x) => !themes[x.id]).length,
  };
  const total = [has.unproxiedPlugins, has.plugins, has.themes].reduce(
    (x, a) => x + a,
    0,
  );
  const [options, setOptions] = React.useState<SyncImportOptions>(
    defOptions ?? {
      unproxiedPlugins: false,
      plugins: !!has.plugins,
      themes: !!has.themes,
    },
  );

  const styles = stylesheet.createThemedStyleSheet({
    icon: {
      width: 18,
      height: 18,
      tintColor: semanticColors.TEXT_BRAND,
      marginRight: 4,
    },
    btnIcon: {
      tintColor: semanticColors.TEXT_NORMAL,
      marginRight: 8,
    },
  });

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title={"Import Data"}
          trailing={
            <ActionSheetCloseButton onPress={() => hideActionSheet()} />
          }
        />
        {!total && (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              <RN.Image
                source={getAssetIDByName("ic_info_24px")}
                style={styles.icon}
                resizeMode="cover"
              />
              <SimpleText
                variant="text-md/semibold"
                color="TEXT_BRAND"
                align="center"
              >
                All addons in the cloud are already imported
              </SimpleText>
            </View>
          </>
        )}
        <FormCheckboxRow
          label={`Unproxied Plugins (${has.unproxiedPlugins})`}
          disabled={!has.unproxiedPlugins}
          onPress={() =>
            has.unproxiedPlugins &&
            (!options.unproxiedPlugins && !defOptions
              ? showConfirmationAlert({
                  title: "Warning",
                  content:
                    "Installing unproxied plugins can be dangerous since they haven't been verified by Vendetta staff. Are you sure you want to import them?",
                  isDismissable: true,
                  confirmText: "Yes",
                  confirmColor: "brand" as ButtonColors,
                  onConfirm: () =>
                    openSheet(ImportActionSheet, {
                      save,
                      navigation,
                      defOptions: {
                        ...options,
                        unproxiedPlugins: true,
                      },
                    }),
                  cancelText: "Cancel",
                })
              : setOptions({
                  ...options,
                  unproxiedPlugins: !options.unproxiedPlugins,
                }))
          }
          selected={options.unproxiedPlugins}
        />
        <FormCheckboxRow
          label={`Plugins (${has.plugins})`}
          disabled={!has.plugins}
          onPress={() =>
            has.plugins &&
            setOptions({
              ...options,
              plugins: !options.plugins,
            })
          }
          selected={options.plugins}
        />
        <FormCheckboxRow
          label={`Themes (${has.themes})`}
          disabled={!has.themes}
          onPress={() =>
            has.themes &&
            setOptions({
              ...options,
              themes: !options.themes,
            })
          }
          selected={options.themes}
        />
        <RedesignButton
          text="Import"
          variant="positive"
          size="md"
          icon={getAssetIDByName("ic_download_24px")}
          onPress={() => {
            openImportLogsPage(navigation);
            importData(save, options);
            hideActionSheet();
          }}
          style={{
            marginHorizontal: 16,
            marginVertical: 16,
          }}
          disabled={
            !options.unproxiedPlugins && !options.plugins && !options.themes
          }
        />
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
