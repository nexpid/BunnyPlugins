import { useProxy, wrapSync } from "@vendetta/storage";
import { cache, vstorage, emitterAvailable } from "..";
import { Forms, General } from "@vendetta/ui/components";
import {
  BetterTableRowGroup,
  LineDivider,
  SimpleText,
  openSheet,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import DataStat from "./DataStat";
import { openOauth2Modal } from "../stuff/oauth2";
import {
  currentAuthorization,
  deleteSaveData,
  syncSaveData,
} from "../stuff/api";
import { showToast } from "@vendetta/ui/toasts";
import {
  NavigationNative,
  React,
  ReactNative as RN,
  url,
} from "@vendetta/metro/common";
import PluginSettingsPage from "./pages/PluginSettingsPage";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { showConfirmationAlert, showInputAlert } from "@vendetta/ui/alerts";
import ImportActionSheet from "./sheets/ImportActionSheet";
import { grabEverything, setImportCallback } from "../stuff/syncStuff";
import { decrypt, encrypt } from "../stuff/crypt";
import constants from "../constants";
import { makeSound } from "../stuff/sound";

const { ScrollView, View } = General;
const { FormRow, FormInput, FormSwitchRow } = Forms;

const UserStore = findByStoreName("UserStore");
const DocumentPicker = findByProps("pickSingle", "isCancel");

const deltaruneCreepyJingle = wrapSync(
  makeSound(`${constants.raw}assets/snd_creepyjingle.ogg`)
);
const undertaleMysteryGo = wrapSync(
  makeSound(`${constants.raw}assets/snd_mysterygo.ogg`)
);

export default function () {
  const [showDev, setShowDev] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState([]);
  useProxy(cache);
  useProxy(vstorage);

  const setBusy = (x: string) =>
    !isBusy.includes(x) && setIsBusy([...isBusy, x]);
  const unBusy = (x: string) => setIsBusy(isBusy.filter((y) => x !== y));

  let lastTap = 0;

  const navigation = NavigationNative.useNavigation();

  const isAuthed = !!currentAuthorization();
  const hasData = !!cache.save;

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
        onTitlePress={() =>
          lastTap >= Date.now()
            ? (showDev
                ? undertaleMysteryGo.play()
                : deltaruneCreepyJingle.play(),
              setShowDev(!showDev),
              (lastTap = 0))
            : (lastTap = Date.now() + 500)
        }
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
        {showDev && (
          <>
            <LineDivider addPadding={true} />
            <FormRow
              label="Custom Host"
              subLabel="Custom URL for the CloudSync backend API"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
            />
            <FormInput
              title=""
              keyboardType="numeric"
              placeholder="1"
              value={constants.api}
              onChange={(x: string) => (vstorage.host = x)}
              style={{ marginTop: -25, marginHorizontal: 12 }}
            />
          </>
        )}
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
        padding={!isAuthed || !hasData}
      >
        {isAuthed && hasData ? (
          <>
            <FormRow
              label="Save Data"
              subLabel="Saves your data to the CloudSync API"
              leading={
                isBusy.includes("save_api") ? (
                  <RN.ActivityIndicator size="small" />
                ) : (
                  <FormRow.Icon
                    source={getAssetIDByName("ic_file_upload_24px")}
                  />
                )
              }
              onPress={() => {
                showConfirmationAlert({
                  title: "Save data",
                  content: "Are you sure you want to overwrite your save data?",
                  confirmText: "Overwrite",
                  confirmColor: "BRAND" as ButtonColors,
                  onConfirm: async () => {
                    setBusy("save_api");
                    try {
                      cache.save = await syncSaveData(await grabEverything());

                      showToast(
                        "Successfully synced data",
                        getAssetIDByName("Check")
                      );
                    } catch (e) {
                      showToast(String(e), getAssetIDByName("Small"));
                    }

                    unBusy("save_api");
                  },
                  cancelText: "Cancel",
                });
              }}
            />
            <FormRow
              label="Import Data"
              subLabel="Imports data from the CloudSync API"
              leading={
                isBusy.includes("import_api") ? (
                  <RN.ActivityIndicator size="small" />
                ) : (
                  <FormRow.Icon source={getAssetIDByName("ic_download_24px")} />
                )
              }
              onPress={() => {
                openSheet(ImportActionSheet, {
                  navigation,
                });
                setImportCallback((x) =>
                  x ? setBusy("import_api") : unBusy("import_api")
                );
              }}
            />
            <LineDivider addPadding={true} />
            <FormRow
              label="Export Local Data"
              subLabel="Exports data to a .txt file"
              leading={
                isBusy.includes("export_local") ? (
                  <RN.ActivityIndicator size="small" />
                ) : (
                  <FormRow.Icon
                    source={getAssetIDByName("ic_file_upload_24px")}
                  />
                )
              }
              onPress={async () => {
                showInputAlert({
                  title: "Enter encryption key",
                  placeholder: "secret password",
                  confirmText: "Enter",
                  onConfirm: async (inp) => {
                    if (!inp) throw new Error("An encryption key must be set");
                    if (isBusy.length) return;
                    setBusy("local_export");

                    let text: string;
                    try {
                      text = encrypt(JSON.stringify(cache.save), inp);
                    } catch {
                      unBusy("local_export");
                      return showToast(
                        "Failed to encrypt!",
                        getAssetIDByName("Small")
                      );
                    }

                    showToast(
                      "Downloading file in your browser",
                      getAssetIDByName("Check")
                    );
                    url.openURL(
                      `${constants.api}api/download?data=${encodeURIComponent(
                        text
                      )}`
                    );
                    unBusy("local_export");
                  },
                });
              }}
            />
            <FormRow
              label="Import Local Data"
              subLabel="Imports data from a .txt file"
              leading={
                isBusy.includes("import_local") ? (
                  <RN.ActivityIndicator size="small" />
                ) : (
                  <FormRow.Icon source={getAssetIDByName("ic_download_24px")} />
                )
              }
              onPress={async () => {
                if (isBusy.length) return;
                setBusy("import_local");

                let text: string;
                try {
                  const { uri, type } = await DocumentPicker.pickSingle({
                    type: DocumentPicker.types.plainText,
                    mode: "open",
                  });
                  if (type === "text/plain")
                    text = await (await fetch(uri)).text();
                } catch (e) {
                  if (!DocumentPicker.isCancel(e))
                    showToast(`Got an error! ${e}`, getAssetIDByName("Small"));
                }

                unBusy("import_local");
                if (!text) return;

                showInputAlert({
                  title: "Enter decryption key",
                  placeholder: "secret password",
                  confirmText: "Enter",
                  onConfirm: async (inp) => {
                    if (!inp) throw new Error("A decryption key must be set");
                    if (isBusy.length) return;
                    setBusy("import_local");

                    try {
                      const data = JSON.parse(decrypt(text, inp));
                      openSheet(ImportActionSheet, {
                        save: data,
                        navigation,
                      });
                      setImportCallback((x) =>
                        x ? setBusy("import_local") : unBusy("import_local")
                      );
                    } catch {
                      unBusy("import_local");
                      return showToast(
                        "Failed to decrypt!",
                        getAssetIDByName("Small")
                      );
                    }
                  },
                });
              }}
            />
          </>
        ) : !isAuthed ? (
          <SimpleText
            variant="text-md/semibold"
            color="TEXT_NORMAL"
            align="center"
          >
            Authenticate first to manage your data
          </SimpleText>
        ) : (
          <RN.ActivityIndicator size="small" style={{ flex: 1 }} />
        )}
      </BetterTableRowGroup>
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}
