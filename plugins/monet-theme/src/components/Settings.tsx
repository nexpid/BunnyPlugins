import {
  NavigationNative,
  ReactNative as RN,
  React,
  clipboard,
  stylesheet,
  url,
} from "@vendetta/metro/common";
import { Forms, General } from "@vendetta/ui/components";
import {
  BetterTableRowGroup,
  LineDivider,
  RichText,
  SimpleText,
  SuperAwesomeIcon,
} from "../../../../stuff/types";
import { VendettaSysColors } from "../../../../stuff/typings";
import { getAssetIDByName } from "@vendetta/ui/assets";
import Color from "./Color";
import {
  commitsURL,
  devPatchesURL,
  migrateStorage,
  patchesURL,
  vstorage,
} from "..";
import { createFileBackend, useProxy } from "@vendetta/storage";
import { showToast } from "@vendetta/ui/toasts";
import { showConfirmationAlert, showInputAlert } from "@vendetta/ui/alerts";
import { build } from "../stuff/buildTheme";
import Commit, { CommitObj } from "./Commit";
import { openCommitsPage } from "./pages/CommitsPage";
import { parse } from "../stuff/jsoncParser";
import { id } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";
import { getDebugInfo } from "@vendetta/debug";
import { openPluginReportSheet } from "../../../../stuff/githubReport";
import { checkForURL, fetchRawTheme, parseTheme } from "../stuff/repainter";
import { Patches } from "../types";
import { transform } from "../stuff/colors";
import { toggle } from "../stuff/livePreview";
import { openConfigurePage } from "./pages/ConfigurePage";
import PreviewButton from "./PreviewButton";

const { BundleUpdaterManager } = window.nativeModuleProxy;

const { ScrollView, View, Pressable } = General;
const { FormRow, FormSwitchRow } = Forms;

const { TextStyleSheet } = findByProps("TextStyleSheet");
const mdSize = TextStyleSheet["text-md/semibold"].fontSize;

function transformObject<T extends Record<string, string>>(obj: T): T {
  for (const [k, v] of Object.entries(obj)) {
    //@ts-ignore shut the fuck up typescript
    obj[k] = transform(v);
  }
  return obj;
}

export function setColorsFromDynamic(clr: VendettaSysColors) {
  vstorage.colors = transformObject({
    neutral1: clr.neutral1[7],
    neutral2: clr.neutral2[7],
    accent1: clr.accent1[7],
    accent2: clr.accent2[7],
    accent3: clr.accent3[7],
  });
}

export let stsCommits: CommitObj[];
export let stsPatches: Patches;
export default () => {
  migrateStorage();
  const navigation = NavigationNative.useNavigation();
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const [commits, setCommits] = React.useState<CommitObj[] | undefined>(
    undefined
  );
  const [usePatches, setUsePatches] = React.useState<"git" | "local">("git");
  const [patches, setPatches] = React.useState<Patches | undefined>(undefined);
  stsCommits = commits;
  stsPatches = patches;

  useProxy(vstorage);

  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 8,
    },
    warning: {
      color: semanticColors.TEXT_DANGER,
    },
    info: {
      color: semanticColors.TEXT_BRAND,
    },
    experimental: {
      backgroundColor: semanticColors.TEXT_BRAND,
      borderRadius: 4,
      paddingHorizontal: 3,
      paddingVertical: 3,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    window: {
      height: "100%",
      backgroundColor: semanticColors.BACKGROUND_MOBILE_PRIMARY,
    },
  });

  React.useEffect(() => {
    if (!patches)
      fetch(usePatches === "git" ? patchesURL : devPatchesURL, {
        cache: "no-store",
      })
        .then((x) =>
          x.text().then((text) => {
            try {
              setPatches(parse(text.replace(/\r/g, "")));
            } catch {
              return showToast(
                "Failed to parse patches.json",
                getAssetIDByName("Small")
              );
            }
          })
        )
        .catch(() =>
          showToast("Failed to fetch patches.json", getAssetIDByName("Small"))
        );
  }, [patches]);
  React.useEffect(() => {
    if (!commits)
      fetch(commitsURL, { cache: "no-store" })
        .then((x) =>
          x
            .json()
            .then((x) => setCommits(x))
            .catch(() =>
              showToast("Failed to parse commits", getAssetIDByName("Small"))
            )
        )
        .catch(() =>
          showToast("Failed to fetch commits", getAssetIDByName("Small"))
        );
  }, [commits]);

  React.useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      unsub();
      navigation.setOptions({
        headerRight: () => <PreviewButton onPressExtra={forceUpdate} />,
      });
    });
    navigation.addListener("beforeRemove", () => {
      toggle(false);
      forceUpdate();
    });
  }, [navigation]);

  let showMessage: {
    error: boolean;
    message: string;
    cta?: string;
    onPress: () => void;
  };

  const debug = getDebugInfo() as any;
  const syscolors = window[
    window.__vendetta_loader?.features?.syscolors?.prop
  ] as VendettaSysColors | null | undefined;

  if (debug.os.name !== "Android")
    showMessage = {
      error: false,
      message: "Dynamic colors are only available on Android.",
      onPress: () => {},
    };
  else if (debug.os.sdk < 31)
    showMessage = {
      error: false,
      message: "Dynamic colors are only available on Android 12+ (SDK 31+).",
      onPress: () => {},
    };
  else if (syscolors === undefined)
    showMessage = {
      error: false,
      message: "Dynamic colors are only available on newest Vendetta version.",
      onPress: () => {},
    };
  else if (syscolors === null)
    showMessage = {
      error: false,
      message: "Dynamic colors are unavailable.",
      onPress: () => {},
    };

  if (!vstorage.colors) {
    if (syscolors) setColorsFromDynamic(syscolors);
    else
      vstorage.colors = transformObject({
        neutral1: "#747679",
        neutral2: "#70777C",
        accent1: "#007FAC",
        accent2: "#657985",
        accent3: "#787296",
      });
    return <></>;
  }

  let lastThemePressTime = 0;
  return (
    <ScrollView style={styles.window}>
      {showMessage && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          <RN.Image
            source={getAssetIDByName(
              showMessage.error ? "ic_warning_24px" : "ic_info_24px"
            )}
            style={{
              width: mdSize,
              height: mdSize,
              tintColor: showMessage.error
                ? styles.warning.color
                : styles.info.color,
              marginRight: 4,
            }}
          />
          <SimpleText
            variant="text-md/semibold"
            color={showMessage.error ? "TEXT_DANGER" : "TEXT_BRAND"}
          >
            {showMessage.message}
            {showMessage.cta && (
              <RichText.Underline onPress={showMessage.onPress}>
                {showMessage.cta}
              </RichText.Underline>
            )}
          </SimpleText>
        </View>
      )}
      <BetterTableRowGroup
        title="Colors"
        icon={getAssetIDByName("ic_theme_24px")}
        padding={true}
      >
        <View
          style={{
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {syscolors && (
            <Pressable
              android_ripple={styles.androidRipple}
              disabled={false}
              accessibilityRole={"button"}
              accessibilityState={{
                disabled: false,
                expanded: false,
              }}
              accessibilityLabel="Autofill button"
              accessibilityHint="Autofills colors to system's dynamic colors"
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 4,
                paddingVertical: 4,
              }}
              onPress={() => {
                setColorsFromDynamic(syscolors);
                showToast("Autofilled", getAssetIDByName("Check"));
              }}
            >
              <RN.Image
                source={getAssetIDByName("img_nitro_remixing")}
                style={{
                  width: mdSize,
                  height: mdSize,
                  marginRight: 4,
                }}
              />
              <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
                Autofill
              </SimpleText>
            </Pressable>
          )}
          {syscolors && (
            <SimpleText
              variant="text-md/semibold"
              color="TEXT_NORMAL"
              style={{ marginHorizontal: 5 }}
            >
              •
            </SimpleText>
          )}
          <Pressable
            android_ripple={styles.androidRipple}
            disabled={false}
            accessibilityRole={"button"}
            accessibilityState={{
              disabled: false,
              expanded: false,
            }}
            accessibilityLabel="Use Repainter theme"
            accessibilityHint="Inputs a Repainter theme"
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 4,
              paddingVertical: 4,
            }}
            onPress={async () => {
              const link = checkForURL((await clipboard.getString()) ?? "");
              showInputAlert({
                title: "Enter Repainter link",
                placeholder: "https://repainter.app/themes/123ABC",
                initialValue: link,
                confirmText: "Use",
                onConfirm: async (i) => {
                  const link = checkForURL(i);
                  if (!link) throw new Error("No Repainter link found!");

                  const theme = parseTheme(await fetchRawTheme(link));
                  vstorage.colors = theme.colors;
                  showToast("Imported", getAssetIDByName("toast_image_saved"));
                },
                confirmColor: "brand" as ButtonColors,
                cancelText: "Cancel",
              });
            }}
          >
            <RN.Image
              source={getAssetIDByName("ic_theme_24px")}
              style={{
                width: mdSize,
                height: mdSize,
                marginRight: 4,
              }}
            />
            <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
              Use Repainter theme
            </SimpleText>
          </Pressable>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Color
            title={"Neutral\n"}
            color={vstorage.colors.neutral1}
            update={(c) => (vstorage.colors.neutral1 = c)}
          />
          <Color
            title={"Neutral\nVariant"}
            color={vstorage.colors.neutral2}
            update={(c) => (vstorage.colors.neutral2 = c)}
          />
          <Color
            title={"Primary\n"}
            color={vstorage.colors.accent1}
            update={(c) => (vstorage.colors.accent1 = c)}
          />
          <Color
            title={"Secondary\n"}
            color={vstorage.colors.accent2}
            update={(c) => (vstorage.colors.accent2 = c)}
          />
          <Color
            title={"Tertiary\n"}
            color={vstorage.colors.accent3}
            update={(c) => (vstorage.colors.accent3 = c)}
          />
        </View>
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title="Theme"
        icon={getAssetIDByName("ic_cog_24px")}
        padding={!patches}
        onTitlePress={() => {
          if (lastThemePressTime >= Date.now()) {
            lastThemePressTime = 0;
            showToast(
              `Now using: ${usePatches === "git" ? "Local" : "GitHub"} patches`
            );
            setUsePatches(usePatches === "git" ? "local" : "git");
            setPatches(undefined);
          } else lastThemePressTime = Date.now() + 500;
        }}
      >
        {!patches ? (
          <RN.ActivityIndicator style={{ marginVertical: 166 }} size="small" />
        ) : (
          <>
            {!commits ? (
              <RN.ActivityIndicator
                style={{ marginVertical: 35 }}
                size="small"
              />
            ) : Array.isArray(commits) ? (
              <Commit
                commit={commits[0]}
                onPress={() => openCommitsPage(navigation)}
              />
            ) : (
              <View
                style={{
                  marginTop: 35,
                  marginBottom: 20,
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <SimpleText
                  variant="text-md/semibold"
                  color="TEXT_DANGER"
                  align="center"
                >
                  You got ratelimited by GitHub. Congrats!
                </SimpleText>
                <SimpleText
                  variant="text-md/semibold"
                  color="TEXT_DANGER"
                  align="center"
                  onPress={() => setCommits(undefined)}
                >
                  <RichText.Underline>Tap to retry</RichText.Underline>
                </SimpleText>
              </View>
            )}
            <LineDivider addPadding={true} />
            <FormRow
              label="Load Theme"
              leading={<FormRow.Icon source={getAssetIDByName("debug")} />}
              onPress={async () => {
                transformObject(vstorage.colors);

                let theme;
                try {
                  theme = build(patches);
                } catch (e) {
                  return showToast(e.toString(), getAssetIDByName("Small"));
                }
                await createFileBackend("vendetta_theme.json").set({
                  id: id,
                  selected: true,
                  data: theme,
                } as Theme);
                showToast("Loaded theme", getAssetIDByName("Check"));

                showConfirmationAlert({
                  title: "Reload required",
                  content:
                    "A reload is required to load this theme. Do you want to reload?",
                  confirmText: "Reload Now",
                  confirmColor: "red" as ButtonColors,
                  cancelText: "Later",
                  onConfirm: () => BundleUpdaterManager.reload(),
                });
              }}
            />
            <FormRow
              label="Configure Theme"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
              trailing={<FormRow.Arrow />}
              onPress={() => openConfigurePage(navigation)}
            />
            <FormSwitchRow
              label="Automatically Reapply Theme"
              subLabel="Automatically reapplies the theme upon reload when your system colors change"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
              onValueChange={() =>
                (vstorage.autoReapply = !vstorage.autoReapply)
              }
              value={vstorage.autoReapply}
            />
            <FormRow
              label="Reload Theme Patches"
              subLabel={`Patch v${patches.version}, ${
                JSON.stringify(patches).length / 100
              }kB (using ${usePatches === "git" ? "GitHub" : "local"})`}
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_sync_24px")} />
              }
              onPress={() => {
                setPatches(undefined);
              }}
            />
          </>
        )}
      </BetterTableRowGroup>
      <View style={{ height: 12 }} />
    </ScrollView>
  );
};
