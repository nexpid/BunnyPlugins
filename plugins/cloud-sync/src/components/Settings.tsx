import { findByProps, findByStoreName } from "@vendetta/metro";
import {
  NavigationNative,
  React,
  ReactNative as RN,
} from "@vendetta/metro/common";
import { useProxy, wrapSync } from "@vendetta/storage";
import { showConfirmationAlert, showInputAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import LineDivider from "$/components/LineDivider";
import Text from "$/components/Text";
import { openSheet } from "$/types";
import RNFS from "$/wrappers/RNFS";

import { cache, emitterAvailable, lang, vstorage } from "..";
import constants, { defaultClientId, defaultRoot } from "../constants";
import {
  currentAuthorization,
  deleteSaveData,
  syncSaveData,
  uploadFile,
} from "../stuff/api";
import { openOauth2Modal } from "../stuff/oauth2";
import { makeSound } from "../stuff/sound";
import { grabEverything, setImportCallback } from "../stuff/syncStuff";
import { CryptoWebViewHandler, decrypt, encrypt } from "./CryptoWebView";
import DataStat from "./DataStat";
import PluginSettingsPage from "./pages/PluginSettingsPage";
import ImportActionSheet from "./sheets/ImportActionSheet";

const DocumentPicker = findByProps("pickSingle", "isCancel");
const { downloadMediaAsset } = findByProps("downloadMediaAsset");

const { ScrollView, View } = General;
const { FormRow, FormInput, FormSwitchRow } = Forms;

const UserStore = findByStoreName("UserStore");

const deltaruneCreepyJingle = wrapSync(
  makeSound(`${constants.raw}assets/snd_creepyjingle.ogg`, 1.6),
);
const undertaleMysteryGo = wrapSync(
  makeSound(`${constants.raw}assets/snd_mysterygo.ogg`, 2.2),
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
        title={lang.format("settings.current_data.title", {})}
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
            subtitle={"settings.current_data.plugins"}
          />
          <DataStat
            count={cache.save?.sync?.themes?.length ?? "-"}
            subtitle={"settings.current_data.themes"}
          />
        </View>
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title={lang.format("settings.config.title", {})}
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
          label={lang.format("settings.config.auto_save.title", {})}
          subLabel={lang.format("settings.config.auto_save.description", {})}
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_contact_sync")} />
          }
          onValueChange={() => (vstorage.autoSync = !vstorage.autoSync)}
          value={vstorage.autoSync}
        />
        {!emitterAvailable && vstorage.autoSync && (
          <Text
            variant="text-md/semibold"
            color="TEXT_DANGER"
            style={{ marginHorizontal: 20, marginVertical: 2 }}
          >
            You must reinstall your client in order to use Auto Save!
          </Text>
        )}
        <FormSwitchRow
          label={lang.format("settings.config.settings_pin.title", {})}
          subLabel={lang.format("settings.config.settings_pin.description", {})}
          leading={<FormRow.Icon source={getAssetIDByName("ic_message_pin")} />}
          onValueChange={() =>
            (vstorage.addToSettings = !vstorage.addToSettings)
          }
          value={vstorage.addToSettings}
        />
        <FormRow
          label={lang.format("page.plugin_settings.title", {})}
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
              label={lang.format("settings.dev.api_url.title", {})}
              subLabel={lang.format("settings.dev.api_url.description", {})}
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
              label={lang.format("settings.dev.client_id.title", {})}
              subLabel={lang.format("settings.dev.client_id.description", {})}
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
        title={lang.format("settings.auth.title", {})}
        icon={getAssetIDByName("lock")}
      >
        {currentAuthorization() ? (
          <>
            <FormRow
              label={lang.format("settings.auth.log_out.title", {})}
              subLabel={lang.format("settings.auth.log_out.description", {})}
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_logout_24px")} />
              }
              onPress={() =>
                showConfirmationAlert({
                  title: lang.format("alert.log_out.title", {}),
                  content: lang.format("alert.log_out.body", {}),
                  confirmColor: "BRAND" as ButtonColors,
                  onConfirm: () => {
                    delete vstorage.auth[UserStore.getCurrentUser().id];
                    delete cache.save;

                    showToast(
                      lang.format("toast.logout", {}),
                      getAssetIDByName("ic_logout_24px"),
                    );
                  },
                })
              }
            />
            <FormRow
              label={lang.format("settings.auth.delete_data.title", {})}
              subLabel={lang.format(
                "settings.auth.delete_data.description",
                {},
              )}
              leading={<FormRow.Icon source={getAssetIDByName("trash")} />}
              onPress={() =>
                showConfirmationAlert({
                  title: lang.format("alert.delete_data.title", {}),
                  content: lang.format("alert.delete_data.body", {}),
                  confirmText: lang.format("alert.delete_data.confirm", {}),
                  confirmColor: "RED" as ButtonColors,
                  onConfirm: async () => {
                    await deleteSaveData();
                    delete vstorage.auth[UserStore.getCurrentUser().id];
                    delete cache.save;

                    showToast(
                      lang.format("toast.deleted_data", {}),
                      getAssetIDByName("trash"),
                    );
                  },
                })
              }
            />
          </>
        ) : (
          <FormRow
            label={lang.format("settings.auth.authorize", {})}
            leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
            trailing={FormRow.Arrow}
            onPress={openOauth2Modal}
          />
        )}
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title={lang.format("settings.data.title", {})}
        icon={getAssetIDByName("ic_message_edit")}
        padding={!isAuthed || !hasData}
      >
        {isAuthed && hasData ? (
          <>
            <FormRow
              label={lang.format("settings.data.save_data.title", {})}
              subLabel={lang.format("settings.data.save_data.description", {})}
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
                  title: lang.format("alert.save_data.title", {}),
                  content: lang.format("alert.save_data.body", {}),
                  confirmText: lang.format("alert.save_data.confirm", {}),
                  confirmColor: "BRAND" as ButtonColors,
                  onConfirm: async () => {
                    setBusy("save_api");
                    try {
                      cache.save = await syncSaveData(await grabEverything());

                      showToast(
                        lang.format("toast.saved_data", {}),
                        getAssetIDByName("Check"),
                      );
                    } catch (e) {
                      showToast(String(e), getAssetIDByName("Small"));
                    }

                    unBusy("save_api");
                  },
                })
              }
            />
            <FormRow
              label={lang.format("sheet.import_data.title", {})}
              subLabel={lang.format(
                "settings.data.import_data.description",
                {},
              )}
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
                  x ? setBusy("import_api") : unBusy("import_api"),
                );
              }}
            />
            <LineDivider addPadding={true} />
            <FormRow
              label={lang.format("settings.data.export_local_data.title", {})}
              subLabel={lang.format(
                "settings.data.export_local_data.description",
                {},
              )}
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
                  title: lang.format("alert.encryption_key.title", {}),
                  placeholder: lang.format(
                    "alert.encryption_key.placeholder",
                    {},
                  ),
                  confirmText: lang.format("alert.encryption_key.confirm", {}),
                  onConfirm: async (inp) => {
                    if (!inp)
                      throw new Error(
                        lang.format("alert.encryption_key.required", {}),
                      );
                    if (isBusy.length) return;
                    setBusy("local_export");

                    let text: string;
                    try {
                      text = await encrypt(JSON.stringify(cache.save), inp);
                    } catch {
                      unBusy("local_export");
                      return showToast(
                        lang.format("toast.encrypt_fail", {}),
                        getAssetIDByName("Small"),
                      );
                    }

                    if (RNFS.hasRNFS) {
                      // yay!
                      const file = `CloudSync_${Math.floor(
                        Math.random() * 10000,
                      )}.txt`;
                      RNFS.writeFile(
                        RNFS.DownloadDirectoryPath + `/${file}`,
                        text,
                      );
                      showToast(
                        lang.format("toast.backup_saved", { file }),
                        getAssetIDByName("ic_file_small_document"),
                      );
                    } else {
                      showToast(
                        lang.format("toast.backup_download_prepare", {}),
                        getAssetIDByName("ic_upload"),
                      );
                      let data: Awaited<ReturnType<typeof uploadFile>>;
                      try {
                        data = await uploadFile(text);
                      } catch (e) {
                        unBusy("local_export");
                        return showToast(
                          e?.message ?? `${e}`,
                          getAssetIDByName("Small"),
                        );
                      }

                      showToast(
                        lang.format("toast.backup_saved", { file: data.key }),
                        getAssetIDByName("ic_file_small_document"),
                      );
                      downloadMediaAsset(
                        `https://hst.sh/raw/${data.key}.txt`,
                        3,
                      );
                    }
                    unBusy("local_export");
                  },
                });
              }}
            />
            <FormRow
              label={lang.format("settings.data.import_local_data.title", {})}
              subLabel={lang.format(
                "settings.data.import_local_data.description",
                {},
              )}
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
                  const { fileCopyUri, type } = await DocumentPicker.pickSingle(
                    {
                      type: DocumentPicker.types.plainText,
                      mode: "open",
                      copyTo: "cachesDirectory",
                    },
                  );
                  if (type === "text/plain" || !fileCopyUri)
                    text = await RNFS.readFile(fileCopyUri.slice(5), "utf8");
                } catch (e) {
                  if (!DocumentPicker.isCancel(e))
                    showToast(
                      lang.format("toast.errored", { error: e }),
                      getAssetIDByName("Small"),
                    );
                }

                unBusy("import_local");
                if (!text) return;

                showInputAlert({
                  title: lang.format("alert.decryption_key.title", {}),
                  placeholder: lang.format(
                    "alert.decryption_key.placeholder",
                    {},
                  ),
                  confirmText: lang.format("alert.decryption_key.confirm", {}),
                  onConfirm: async (inp) => {
                    if (!inp)
                      throw new Error(
                        lang.format("alert.decryption_key.required", {}),
                      );
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
                        x ? setBusy("import_local") : unBusy("import_local"),
                      );
                    } catch {
                      unBusy("import_local");
                      return showToast(
                        lang.format("toast.decrypt_fail", {}),
                        getAssetIDByName("Small"),
                      );
                    }
                  },
                });
              }}
            />
          </>
        ) : !isAuthed ? (
          <Text variant="text-md/semibold" color="TEXT_NORMAL" align="center">
            {lang.format("settings.label.auth_needed", {})}
          </Text>
        ) : (
          <RN.ActivityIndicator size="small" style={{ flex: 1 }} />
        )}
      </BetterTableRowGroup>
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}
