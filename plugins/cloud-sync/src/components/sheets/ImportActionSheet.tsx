import { Button, Forms, General } from "@vendetta/ui/components";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  hideActionSheet,
  openSheet,
} from "../../../../../stuff/types";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { cache, canImport, isPluginProxied } from "../..";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { SyncImportOptions, importData } from "../../stuff/syncStuff";
import { plugins } from "@vendetta/plugins";
import { themes } from "@vendetta/themes";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { View } = General;
const { FormCheckboxRow } = Forms;

export default function ImportActionSheet({
  defOptions,
}: {
  defOptions?: SyncImportOptions;
}) {
  const has = {
    unproxiedPlugins: cache.save.sync.plugins.filter(
      (x) => !plugins[x.id] && !isPluginProxied(x.id) && canImport(x.id)
    ).length,
    plugins: cache.save.sync.plugins.filter(
      (x) => !plugins[x.id] && isPluginProxied(x.id) && canImport(x.id)
    ).length,
    themes: cache.save.sync.themes.filter((x) => !themes[x.id]).length,
  };
  const [options, setOptions] = React.useState<SyncImportOptions>(
    defOptions ?? {
      unproxiedPlugins: false,
      plugins: !!has.plugins,
      themes: !!has.themes,
    }
  );

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title={"Import Data"}
          trailing={
            <ActionSheetCloseButton onPress={() => hideActionSheet()} />
          }
        />
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
        <Button
          text="Import"
          color="green"
          size="medium"
          renderIcon={() => (
            <RN.Image
              style={{ marginRight: 8 }}
              source={getAssetIDByName("ic_download_24px")}
            />
          )}
          onPress={() => {
            importData(options);
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
