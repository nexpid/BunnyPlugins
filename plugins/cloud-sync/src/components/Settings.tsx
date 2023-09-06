import { useProxy } from "@vendetta/storage";
import { cache, vstorage, emitterAvailable } from "..";
import { Forms, General } from "@vendetta/ui/components";
import {
  BetterTableRowGroup,
  LineDivider,
  SimpleText,
  SuperAwesomeIcon,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import DataStat from "./DataStat";
import { openOauth2Modal } from "../stuff/oauth2";
import { currentAuthorization, deleteSaveData } from "../stuff/api";
import DataManagementButtons from "./DataManagementButtons";
import { showToast } from "@vendetta/ui/toasts";
import { NavigationNative, React, clipboard } from "@vendetta/metro/common";
import PluginSettingsPage from "./pages/PluginSettingsPage";
import { openPluginReportSheet } from "../../../../stuff/githubReport";
import { findByStoreName } from "@vendetta/metro";

const { ScrollView, View } = General;
const { FormRow, FormSwitchRow } = Forms;

const UserStore = findByStoreName("UserStore");

export default function () {
  useProxy(cache);
  useProxy(vstorage);

  const navigation = NavigationNative.useNavigation();
  const unsub = navigation.addListener("focus", () => {
    unsub();
    navigation.setOptions({
      headerRight: () => (
        <SuperAwesomeIcon
          icon={getAssetIDByName("ic_report_message")}
          style="header"
          onPress={() => openPluginReportSheet("cloud-sync")}
        />
      ),
    });
  });

  return (
    <ScrollView>
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
          label="Auto Save"
          subLabel="Automatically save data to cloud"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_contact_sync")} />
          }
          onValueChange={() => (vstorage.autoSync = !vstorage.autoSync)}
          value={vstorage.autoSync ?? false}
        />
        {!emitterAvailable && vstorage.autoSync && (
          <SimpleText
            variant="text-md/semibold"
            color="TEXT_DANGER"
            style={{ marginHorizontal: 20, marginVertical: 2 }}
          >
            You must reinstall Vendetta in order to use Auto Save!
          </SimpleText>
        )}
        <FormSwitchRow
          label="Pin To Settings"
          subLabel="Pin Cloud Sync to the settings page"
          leading={<FormRow.Icon source={getAssetIDByName("ic_message_pin")} />}
          onValueChange={() =>
            (vstorage.addToSettings = !vstorage.addToSettings)
          }
          value={vstorage.addToSettings ?? false}
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
        {currentAuthorization() ? (
          <>
            <FormRow
              label="Log out"
              subLabel="Logs you out of CloudSync"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_logout_24px")} />
              }
              onPress={() => {
                vstorage.auth ??= {};
                delete vstorage.auth[UserStore.getCurrentUser().id];
                delete cache.save;

                showToast(
                  "Successfully logged out",
                  getAssetIDByName("ic_logout_24px")
                );
              }}
            />
            <FormRow
              label="Delete data"
              subLabel="Deletes your CloudSync data"
              leading={<FormRow.Icon source={getAssetIDByName("trash")} />}
              onPress={async () => {
                await deleteSaveData();
                vstorage.auth ??= {};
                delete vstorage.auth[UserStore.getCurrentUser().id];
                delete cache.save;

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
        {currentAuthorization() && (
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
