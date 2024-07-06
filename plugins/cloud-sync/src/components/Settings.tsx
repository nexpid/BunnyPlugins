import { settings } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import {
  i18n,
  NavigationNative,
  React,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import LineDivider from "$/components/LineDivider";
import Text from "$/components/Text";
import { Reanimated } from "$/deps";
import { Lang } from "$/lang";
import { openSheet } from "$/types";
import RNFS from "$/wrappers/RNFS";

import { lang, vstorage } from "..";
import constants, { defaultClientId, defaultHost } from "../constants";
import { useAuthorizationStore } from "../stores/AuthorizationStore";
import { useCacheStore } from "../stores/CacheStore";
import {
  decompressRawData,
  deleteData,
  getRawData,
  saveData,
} from "../stuff/api";
import { openOauth2Modal } from "../stuff/oauth2";
import { grabEverything, setImportCallback } from "../stuff/syncStuff";
import { UserData } from "../types";
import DataStat from "./DataStat";
import IgnoredPluginsPage from "./pages/IgnoredPluginsPage";
import ImportActionSheet from "./sheets/ImportActionSheet";

const DocumentPicker = findByProps("pickSingle", "isCancel");

const { ScrollView, View } = General;
const { FormRow, FormInput, FormSwitchRow } = Forms;

export default function () {
  useProxy(vstorage);
  const [showDev, setShowDev] = React.useState(false);
  const [isBusy, setIsBusy] = React.useState([]);
  const { data, at, hasData } = useCacheStore();
  const { isAuthorized } = useAuthorizationStore();

  const navigation = NavigationNative.useNavigation();

  const setBusy = (x: string) =>
    !isBusy.includes(x) && setIsBusy([...isBusy, x]);
  const unBusy = (x: string) => setIsBusy(isBusy.filter((y) => x !== y));
  let lastTap = 0;

  const bumpyScaleX = Reanimated.useSharedValue(1);
  const bumpyScaleY = Reanimated.useSharedValue(1);

  const bumpyPressScale = Reanimated.useSharedValue(1);
  const bumpyPressRot = Reanimated.useSharedValue("0deg");

  const doBumpiness = () => {
    if (
      !settings.developerSettings ||
      vstorage.realTrackingAnalyticsSentToChina.pressedSettings
    )
      return;

    bumpyPressScale.value = 1.09;
    bumpyPressScale.value = Reanimated.withTiming(1, { duration: 300 });

    const actRot = Math.random() * 10 + 3;
    bumpyPressRot.value = `${Math.random() < 0.5 ? -actRot : actRot}deg`;
    bumpyPressRot.value = Reanimated.withTiming("0deg", { duration: 300 });
  };

  React.useEffect(() => {
    if (
      !settings.developerSettings ||
      vstorage.realTrackingAnalyticsSentToChina.pressedSettings
    ) {
      bumpyScaleX.value = Reanimated.withTiming(1, { duration: 150 });
      bumpyScaleY.value = Reanimated.withTiming(1, { duration: 150 });
      return;
    }

    const mult = 1.08;

    bumpyScaleX.value = 1 / mult;
    bumpyScaleY.value = mult;

    bumpyScaleX.value = Reanimated.withRepeat(
      Reanimated.withTiming(mult, {
        easing: Reanimated.Easing.inOut(Reanimated.Easing.quad),
        duration: 500,
      }),
      -1,
      true,
    );
    bumpyScaleY.value = Reanimated.withRepeat(
      Reanimated.withTiming(1 / mult, {
        easing: Reanimated.Easing.inOut(Reanimated.Easing.quad),
        duration: 500,
      }),
      -1,
      true,
    );
  }, [
    settings.developerSettings,
    vstorage.realTrackingAnalyticsSentToChina.pressedSettings,
  ]);

  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      //@ts-expect-error cornerRadius does not exist :nerd_face:
      cornerRadius: 4,
    },
    titleIcon: {
      width: 16,
      height: 16,
      marginTop: 1.5,
      tintColor: semanticColors.TEXT_MUTED,
    },
  });

  return (
    <ScrollView>
      <BetterTableRowGroup
        title={lang.format("settings.your_data.title", {})}
        icon={getAssetIDByName("MobilePhoneShareIcon")}
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
            count={data ? Object.keys(data.plugins).length : "-"}
            subtitle={"settings.your_data.plugins"}
          />
          <DataStat
            count={data ? Object.keys(data.themes).length : "-"}
            subtitle={"settings.your_data.themes"}
          />
          <DataStat
            count={
              data
                ? Object.keys(data.fonts.installed).length +
                  data.fonts.custom.length
                : "-"
            }
            subtitle={"settings.your_data.fonts"}
          />
        </View>
        {at && (
          <Text variant="text-sm/medium" color="TEXT_MUTED" align="center">
            {Lang.basicFormat(
              lang.format("settings.your_data.last_synced", {
                date: new Date(at).toLocaleString(i18n.getLocale(), {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                }),
              }),
            )}
          </Text>
        )}
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title={
          <RN.Pressable
            android_ripple={styles.androidRipple}
            disabled={false}
            accessibilityRole={"button"}
            onPress={() => {
              if (!vstorage.realTrackingAnalyticsSentToChina.pressedSettings)
                doBumpiness();

              if (lastTap >= Date.now()) {
                vstorage.realTrackingAnalyticsSentToChina.pressedSettings =
                  true;
                setShowDev(!showDev);
                lastTap = 0;
              } else lastTap = Date.now() + 500;
            }}
            style={{ width: "100%", marginBottom: 8 }}
          >
            <Reanimated.default.View
              style={[
                {
                  gap: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                },
                {
                  transform: [
                    { scaleX: bumpyScaleX },
                    { scaleY: bumpyScaleY },
                    { scale: bumpyPressScale },
                    { rotate: bumpyPressRot },
                  ],
                },
              ]}
            >
              <RN.Image
                style={styles.titleIcon}
                source={getAssetIDByName("SettingsIcon")}
                resizeMode="cover"
              />
              <Text variant="text-sm/semibold" color="TEXT_MUTED">
                {lang.format("settings.config.title", {})}
              </Text>
            </Reanimated.default.View>
          </RN.Pressable>
        }
        icon={getAssetIDByName("SettingsIcon")}
      >
        <FormSwitchRow
          label={lang.format("settings.config.auto_save.title", {})}
          subLabel={lang.format("settings.config.auto_save.description", {})}
          leading={<FormRow.Icon source={getAssetIDByName("RefreshIcon")} />}
          onValueChange={() =>
            (vstorage.config.autoSync = !vstorage.config.autoSync)
          }
          value={vstorage.config.autoSync}
        />
        <FormSwitchRow
          label={lang.format("settings.config.settings_pin.title", {})}
          subLabel={lang.format("settings.config.settings_pin.description", {})}
          leading={<FormRow.Icon source={getAssetIDByName("PinIcon")} />}
          onValueChange={() =>
            (vstorage.config.addToSettings = !vstorage.config.addToSettings)
          }
          value={vstorage.config.addToSettings}
        />
        <FormRow
          label={lang.format("page.ignored_plugins.title", {})}
          leading={
            <FormRow.Icon source={getAssetIDByName("ListBulletsIcon")} />
          }
          trailing={<FormRow.Arrow />}
          onPress={() =>
            navigation.push("VendettaCustomPage", {
              render: IgnoredPluginsPage,
            })
          }
        />
        {showDev && (
          <>
            <LineDivider addPadding={true} />
            <FormRow
              label={lang.format("settings.dev.api_url.title", {})}
              subLabel={lang.format("settings.dev.api_url.description", {})}
              leading={<FormRow.Icon source={getAssetIDByName("PencilIcon")} />}
            />
            <FormInput
              title=""
              placeholder={defaultHost}
              value={vstorage.custom.host || defaultHost}
              onChange={(x: string) =>
                (vstorage.custom.host = x.length > 0 ? x : null)
              }
              style={{ marginTop: -25, marginHorizontal: 12 }}
            />
            <FormRow
              label={lang.format("settings.dev.client_id.title", {})}
              subLabel={lang.format("settings.dev.client_id.description", {})}
              leading={<FormRow.Icon source={getAssetIDByName("PencilIcon")} />}
            />
            <FormInput
              title=""
              placeholder={defaultClientId}
              value={constants.oauth2.clientId || defaultClientId}
              onChange={(x: string) =>
                (vstorage.custom.clientId = x.length > 0 ? x : null)
              }
              style={{ marginTop: -25, marginHorizontal: 12 }}
            />
          </>
        )}
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title={lang.format("settings.auth.title", {})}
        icon={getAssetIDByName("LockIcon")}
      >
        {isAuthorized() ? (
          <>
            <FormRow
              label={lang.format("settings.auth.log_out.title", {})}
              subLabel={lang.format("settings.auth.log_out.description", {})}
              // STUB[epic=icon] use new logout icon :3
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_logout_24px")} />
              }
              destructive
              onPress={() =>
                showConfirmationAlert({
                  title: lang.format("alert.log_out.title", {}),
                  content: lang.format("alert.log_out.body", {}),
                  onConfirm: () => {
                    useAuthorizationStore.getState().setToken(null);

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
              leading={<FormRow.Icon source={getAssetIDByName("TrashIcon")} />}
              onPress={() =>
                showConfirmationAlert({
                  title: lang.format("alert.delete_data.title", {}),
                  content: lang.format("alert.delete_data.body", {}),
                  confirmText: lang.format("alert.delete_data.confirm", {}),
                  confirmColor: "red" as ButtonColors,
                  onConfirm: async () => {
                    await deleteData();
                    useAuthorizationStore.getState().setToken(null);

                    showToast(
                      lang.format("toast.deleted_data", {}),
                      getAssetIDByName("TrashIcon"),
                    );
                  },
                })
              }
            />
          </>
        ) : (
          <FormRow
            label={lang.format("settings.auth.authorize", {})}
            leading={<FormRow.Icon source={getAssetIDByName("LinkIcon")} />}
            trailing={FormRow.Arrow}
            onPress={openOauth2Modal}
          />
        )}
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title={lang.format("settings.manage_data.title", {})}
        icon={getAssetIDByName("UserIcon")}
        padding={!isAuthorized() || !data}
      >
        {isAuthorized() && hasData() ? (
          <>
            <FormRow
              label={lang.format("settings.manage_data.save_data.title", {})}
              subLabel={lang.format(
                "settings.manage_data.save_data.description",
                {},
              )}
              leading={
                isBusy.includes("save_api") ? (
                  <RN.ActivityIndicator size="small" />
                ) : (
                  <FormRow.Icon source={getAssetIDByName("UploadIcon")} />
                )
              }
              onPress={() =>
                showConfirmationAlert({
                  title: lang.format("alert.save_data.title", {}),
                  content: lang.format("alert.save_data.body", {}),
                  confirmText: lang.format("alert.save_data.confirm", {}),
                  onConfirm: async () => {
                    setBusy("save_api");
                    try {
                      const everything = await grabEverything();
                      await saveData(everything);

                      showToast(
                        lang.format("toast.saved_data", {}),
                        getAssetIDByName("CircleCheckIcon-primary"),
                      );
                    } catch {
                      // handled in saveData
                    }

                    unBusy("save_api");
                  },
                })
              }
            />
            <FormRow
              label={lang.format("sheet.import_data.title", {})}
              subLabel={lang.format(
                "settings.manage_data.import_data.description",
                {},
              )}
              leading={
                isBusy.includes("import_api") ? (
                  <RN.ActivityIndicator size="small" />
                ) : (
                  <FormRow.Icon source={getAssetIDByName("DownloadIcon")} />
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
              label={lang.format(
                "settings.manage_data.download_compressed.title",
                {},
              )}
              subLabel={lang.format(
                "settings.manage_data.download_compressed.description",
                {},
              )}
              leading={
                isBusy.includes("download_compressed") ? (
                  <RN.ActivityIndicator size="small" />
                ) : (
                  <FormRow.Icon source={getAssetIDByName("DownloadIcon")} />
                )
              }
              onPress={async () => {
                if (isBusy.length) return;
                setBusy("download_compressed");

                let data: string;
                try {
                  data = await getRawData();
                } catch {
                  return unBusy("download_compressed");
                }

                try {
                  const file = `CloudSync_${new Array(5)
                    .fill(0)
                    .map(() => Math.floor(Math.random() * 9) + 1)
                    .join("")}.txt`;
                  await RNFS.writeFile(
                    RNFS.DownloadDirectoryPath + "/" + file,
                    data,
                  );

                  showToast(
                    `Downloaded as ${file}`,
                    getAssetIDByName("FileIcon"),
                  );
                } catch (e) {
                  showToast(e.toString(), getAssetIDByName("CircleXIcon"));
                }

                unBusy("download_compressed");
              }}
            />
            <FormRow
              label={lang.format(
                "settings.manage_data.import_compressed.title",
                {},
              )}
              subLabel={lang.format(
                "settings.manage_data.import_compressed.description",
                {},
              )}
              leading={
                isBusy.includes("import_compressed") ? (
                  <RN.ActivityIndicator size="small" />
                ) : (
                  <FormRow.Icon source={getAssetIDByName("UploadIcon")} />
                )
              }
              onPress={async () => {
                if (isBusy.length) return;
                setBusy("import_compressed");

                let text: string;
                try {
                  const { fileCopyUri, type } = await DocumentPicker.pickSingle(
                    {
                      type: DocumentPicker.types.plainText,
                      mode: "open",
                      copyTo: "cachesDirectory",
                    },
                  );
                  if (type === "text/plain" && fileCopyUri)
                    text = await RNFS.readFile(fileCopyUri.slice(5), "utf8");
                } catch (e) {
                  if (!DocumentPicker.isCancel(e))
                    showToast(
                      lang.format(e.toString(), {}),
                      getAssetIDByName("CircleXIcon"),
                    );
                }

                unBusy("import_compressed");
                if (!text) return;

                let data: UserData;
                try {
                  data = await decompressRawData(text);
                } catch {
                  return unBusy("import_compressed");
                }

                openSheet(ImportActionSheet, {
                  data,
                  navigation,
                });
                unBusy("import_compressed");
                setImportCallback((val) =>
                  val
                    ? setBusy("import_compressed")
                    : unBusy("import_compressed"),
                );
              }}
            />
          </>
        ) : !isAuthorized() ? (
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
