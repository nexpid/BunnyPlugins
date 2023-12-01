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
  uploadFile,
} from "../stuff/api";
import { showToast } from "@vendetta/ui/toasts";
import {
  NavigationNative,
  React,
  ReactNative as RN,
} from "@vendetta/metro/common";
import PluginSettingsPage from "./pages/PluginSettingsPage";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { showConfirmationAlert, showInputAlert } from "@vendetta/ui/alerts";
import ImportActionSheet from "./sheets/ImportActionSheet";
import { grabEverything, setImportCallback } from "../stuff/syncStuff";
import constants, { defaultClientId, defaultRoot } from "../constants";
import { makeSound } from "../stuff/sound";
import { CryptoWebViewHandler, decrypt, encrypt } from "./CryptoWebView";
import { UploadedFile } from "../types/api/latest";

const DocumentPicker = findByProps("pickSingle", "isCancel");
const { downloadMediaAsset } = findByProps("downloadMediaAsset");

const { ScrollView, View } = General;
const { FormRow, FormInput, FormSwitchRow } = Forms;

const UserStore = findByStoreName("UserStore");

const deltaruneCreepyJingle = wrapSync(
  makeSound(`${constants.raw}assets/snd_creepyjingle.ogg`, 1.6)
);
const undertaleMysteryGo = wrapSync(
  makeSound(`${constants.raw}assets/snd_mysterygo.ogg`, 2.2)
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
      <CryptoWebViewHandler />
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
          />
          <DataStat
            count={cache.save?.sync?.themes?.length ?? "-"}
            subtitle="themes"
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
              label="API URL"
              subLabel="Custom URL for the CloudSync backend API"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
            />
            <FormInput
              title=""
              placeholder={defaultRoot}
              value={constants.api}
              onChange={(x: string) => (vstorage.host = x || defaultRoot)}
              style={{ marginTop: -25, marginHorizontal: 12 }}
            />
            <FormRow
              label="Client ID"
              subLabel="Custom client ID for OAuth2"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
            />
            <FormInput
              title=""
              placeholder={defaultClientId}
              value={constants.oauth2.clientId}
              onChange={(x: string) =>
                (vstorage.clientId = x || defaultClientId)
              }
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
              onPress={() =>
                showConfirmationAlert({
                  title: "Log out",
                  content: "Are you sure you want to log out?",
                  confirmText: "Log out",
                  confirmColor: "BRAND" as ButtonColors,
                  onConfirm: () => {
                    vstorage.auth ??= {};
                    delete vstorage.auth[UserStore.getCurrentUser().id];
                    delete cache.save;

                    showToast(
                      "Successfully logged out",
                      getAssetIDByName("ic_logout_24px")
                    );
                  },
                  cancelText: "Cancel",
                })
              }
            />
            <FormRow
              label="Delete data"
              subLabel="Deletes your CloudSync data"
              leading={<FormRow.Icon source={getAssetIDByName("trash")} />}
              onPress={() =>
                showConfirmationAlert({
                  title: "Delete data",
                  content:
                    "Are you sure you want to delete your save data? (this cannot be undone!)",
                  confirmText: "Delete",
                  confirmColor: "RED" as ButtonColors,
                  onConfirm: async () => {
                    await deleteSaveData();
                    vstorage.auth ??= {};
                    delete vstorage.auth[UserStore.getCurrentUser().id];
                    delete cache.save;

                    showToast(
                      "Successfully deleted data",
                      getAssetIDByName("trash")
                    );
                  },
                  cancelText: "Cancel",
                })
              }
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
              onPress={() =>
                showConfirmationAlert({
                  title: "Save data",
                  content:
                    "Are you sure you want to overwrite your save data? (this cannot be undone!)",
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
                })
              }
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
                  cancelText: "Cancel",
                  onConfirm: async (inp) => {
                    if (!inp) throw new Error("An encryption key must be set");
                    if (isBusy.length) return;
                    setBusy("local_export");

                    let text: string;
                    try {
                      text = await encrypt(JSON.stringify(cache.save), inp);
                    } catch {
                      unBusy("local_export");
                      return showToast(
                        "Failed to encrypt!",
                        getAssetIDByName("Small")
                      );
                    }

                    showToast(
                      "Preparing for download...",
                      getAssetIDByName("ic_upload")
                    );
                    let data: UploadedFile;
                    try {
                      data = await uploadFile(text);
                    } catch (e) {
                      unBusy("local_export");
                      return showToast(
                        e?.message ?? `${e}`,
                        getAssetIDByName("Small")
                      );
                    }

                    showToast(
                      "Backup Saved",
                      getAssetIDByName("ic_file_small_document")
                    );
                    downloadMediaAsset(
                      `${constants.api}api/files/${encodeURIComponent(
                        data.key
                      )}/${encodeURIComponent(data.file)}`,
                      3
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
                  const { type, uri } = await DocumentPicker.pickSingle({
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
                  cancelText: "Cancel",
                  confirmText: "Enter",
                  onConfirm: async (inp) => {
                    if (!inp) throw new Error("A decryption key must be set");
                    if (isBusy.length) return;
                    setBusy("import_local");

                    try {
                      const data = JSON.parse(await decrypt(text, inp));
                      openSheet(ImportActionSheet, {
                        save: data,
                        navigation,
                      });
                      unBusy("import_local");
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
