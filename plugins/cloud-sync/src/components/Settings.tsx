import { useProxy } from "@vendetta/storage";
import * as index from "..";
import { cache, cacheUpdated, vstorage } from "..";
import { Forms, General } from "@vendetta/ui/components";
import {
  BetterTableRowGroup,
  LineDivider,
  RichText,
  SuperAwesomeIcon,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import DataStat from "./DataStat";
import { openOauth2Modal } from "../stuff/oauth2";
import { deleteSaveData } from "../stuff/api";
import DataManagementButtons from "./DataManagementButtons";
import { showToast } from "@vendetta/ui/toasts";
import {
  NavigationNative,
  React,
  ReactNative as RN,
  clipboard,
  stylesheet,
  url,
} from "@vendetta/metro/common";
import PluginSettingsPage from "./PluginSettingsPage";
import { isPluginProxied, isSelfProxied } from "../stuff/pluginSecurity";
import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { plugins } from "@vendetta/plugins";
import constants from "../constants";
import { getIssueUrl } from "../../../../stuff/getIssueUrl";

const { ScrollView, View, Text } = General;
const { FormRow, FormSwitchRow } = Forms;

const { TextStyleSheet } = findByProps("TextStyleSheet");
const styles = stylesheet.createThemedStyleSheet({
  warning: {
    ...TextStyleSheet["text-md/semibold"],
    color: semanticColors.TEXT_DANGER,
  },
});

export default function () {
  const [, forceUpdate] = React.useReducer((x) => ~x, 0);

  useProxy(vstorage);

  index.cacheUpd.push(forceUpdate);
  React.useEffect(
    () => () => {
      (index.cacheUpd as any) = index.cacheUpd.filter((x) => x !== forceUpdate);
    },
    []
  );

  const navigation = NavigationNative.useNavigation();
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <SuperAwesomeIcon
          icon={getAssetIDByName("ic_report_message")}
          style="header"
          onPress={() => url.openURL(getIssueUrl("cloud-sync"))}
        />
      ),
    });
  }, []);

  return (
    <ScrollView>
      {isSelfProxied() &&
        Object.keys(plugins).filter((x) => !isPluginProxied(x)).length > 0 && (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <RN.Image
              source={getAssetIDByName("ic_warning_24px")}
              style={{
                width: styles.warning.fontSize,
                height: styles.warning.fontSize,
                tintColor: styles.warning.color,
                marginRight: 4,
              }}
            />
            <Text style={styles.warning}>
              Can load only proxied plugins.{" "}
              <RichText.Underline
                onPress={() =>
                  showConfirmationAlert({
                    title: "Only Proxied Plugins",
                    content:
                      "As requested by Vendetta staff, the proxied version of this plugin cannot load unproxied plugins.",
                    isDismissable: true,
                    confirmText: "Ok",
                    confirmColor: "grey" as ButtonColors,
                    secondaryConfirmText: "Copy unproxied plugin link",
                    onConfirm: () => {},
                    onConfirmSecondary: async () => {
                      clipboard.setString(constants.unproxiedURL);
                      showToast("Copied", getAssetIDByName("Check"));
                    },
                  })
                }
              >
                Learn more
              </RichText.Underline>
            </Text>
          </View>
        )}
      <BetterTableRowGroup
        title="Current Data"
        icon={getAssetIDByName("ic_contact_sync")}
        padding={true}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 8,
          }}
        >
          <DataStat
            count={cache.save?.sync?.plugins?.length ?? "-"}
            subtitle="plugins"
            contents={2}
          />
          <DataStat
            count={cache.save?.sync?.themes?.length ?? "-"}
            subtitle="themes"
            contents={2}
          />
        </View>
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title="Settings"
        icon={getAssetIDByName("ic_cog_24px")}
      >
        <FormSwitchRow
          label="Auto Sync"
          subLabel="Automatically sync data to cloud"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_contact_sync")} />
          }
          onValueChange={() => (vstorage.autoSync = !vstorage.autoSync)}
          value={vstorage.autoSync}
        />
        <FormSwitchRow
          label="Add To Settings"
          subLabel="Add Cloud Sync to the settings page"
          leading={<FormRow.Icon source={getAssetIDByName("ic_message_pin")} />}
          onValueChange={() =>
            (vstorage.addToSettings = !vstorage.addToSettings)
          }
          value={vstorage.addToSettings}
        />
        <FormRow
          label="Plugin Settings"
          leading={<FormRow.Icon source={getAssetIDByName("debug")} />}
          trailing={<FormRow.Arrow />}
          onPress={() =>
            navigation.push("VendettaCustomPage", {
              render: PluginSettingsPage,
            })
          }
        />
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title="Authentication"
        icon={getAssetIDByName("lock")}
      >
        {vstorage.authorization ? (
          <>
            <FormRow
              label="Log out"
              subLabel="Logs you out of CloudSync"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_logout_24px")} />
              }
              onPress={() => {
                delete vstorage.authorization;
                delete cache.save;
                cacheUpdated();

                showToast(
                  "Successfully logged out",
                  getAssetIDByName("ic_logout_24px")
                );
              }}
            />
            <FormRow
              label="Delete data"
              subLabel="Deletes your data and logs you out of CloudSync"
              leading={<FormRow.Icon source={getAssetIDByName("trash")} />}
              onPress={async () => {
                await deleteSaveData();
                delete vstorage.authorization;
                delete cache.save;
                cacheUpdated();

                showToast(
                  "Successfully deleted data",
                  getAssetIDByName("trash")
                );
              }}
            />
          </>
        ) : (
          <FormRow
            label="Authenticate"
            leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
            trailing={FormRow.Arrow}
            onPress={openOauth2Modal}
          />
        )}
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title="Data Management"
        icon={getAssetIDByName("ic_message_edit")}
        padding={true}
      >
        <DataManagementButtons />
        {vstorage.authorization && (
          <>
            <LineDivider />
            <FormRow
              label="Copy Data as JSON"
              leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
              onPress={() => {
                clipboard.setString(
                  JSON.stringify(cache.save ?? {}, undefined, 3)
                );
                showToast("Copied", getAssetIDByName("Check"));
              }}
            />
          </>
        )}
      </BetterTableRowGroup>
    </ScrollView>
  );
}
