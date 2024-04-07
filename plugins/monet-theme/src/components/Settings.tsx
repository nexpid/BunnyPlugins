import { getDebugInfo } from "@vendetta/debug";
import { findByProps } from "@vendetta/metro";
import {
  clipboard,
  NavigationNative,
  React,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { id } from "@vendetta/plugin";
import { createFileBackend, useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { showConfirmationAlert, showInputAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import LineDivider from "$/components/LineDivider";
import { RichText } from "$/components/RichText";
import Text from "$/components/Text";
import { RNBundleUpdaterManager } from "$/deps";
import { LazyActionSheet, TextStyleSheet } from "$/types";
import { ThemeDataWithPlus, VendettaSysColors } from "$/typings";

import {
  commitsURL,
  devPatchesURL,
  getSysColors,
  makeApplyCache,
  makeThemeApplyCache,
  patchesURL,
  vstorage,
} from "..";
import { build } from "../stuff/buildTheme";
import { parse } from "../stuff/jsoncParser";
import { toggle } from "../stuff/livePreview";
import { checkForURL, fetchRawTheme, parseTheme } from "../stuff/repainter";
import { Patches } from "../types";
import Color from "./Color";
import Commit, { CommitObj } from "./Commit";
import { openCommitsPage } from "./pages/CommitsPage";
import { openConfigurePage } from "./pages/ConfigurePage";
import PreviewButton from "./PreviewButton";
import { managePage } from "$/lib/ui";

const { ScrollView, View, Pressable } = General;
const { FormRow, FormSwitchRow } = Forms;
const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");

const mdSize = TextStyleSheet["text-md/semibold"].fontSize;

export function setColorsFromDynamic(clr: VendettaSysColors) {
  vstorage.colors = {
    neutral1: clr.neutral1[7],
    neutral2: clr.neutral2[7],
    accent1: clr.accent1[7],
    accent2: clr.accent2[7],
    accent3: clr.accent3[7],
  };
}

export let stsCommits: CommitObj[];
export let stsPatches: Patches;
export default () => {
  const navigation = NavigationNative.useNavigation();
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const [commits, setCommits] = React.useState<CommitObj[] | undefined>(
    undefined,
  );
  const [patches, setPatches] = React.useState<Patches | undefined>(undefined);
  stsCommits = commits;
  stsPatches = patches;

  const patchesControllerRef = React.useRef<AbortController>();
  const commitsControllerRef = React.useRef<AbortController>();

  const applyCache = makeApplyCache(getSysColors());
  if (JSON.stringify(vstorage.applyCache) !== JSON.stringify(applyCache))
    vstorage.applyCache = applyCache;
  const themeApplyCache = makeThemeApplyCache();
  if (
    JSON.stringify(vstorage.themeApplyCache) !== JSON.stringify(themeApplyCache)
  )
    vstorage.themeApplyCache = themeApplyCache;

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
      backgroundColor: semanticColors.BG_BASE_SECONDARY,
    },
    labelIcon: {
      width: mdSize,
      height: mdSize,
      marginRight: 4,
      tintColor: semanticColors.TEXT_NORMAL,
    },
  });

  React.useEffect(() => {
    if (patches) return;
    patchesControllerRef.current?.abort();

    const controller = new AbortController();
    patchesControllerRef.current = controller;
    fetch(vstorage.patches.from === "local" ? devPatchesURL : patchesURL(), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((x) =>
        x.text().then((text) => {
          try {
            setPatches(parse(text.replace(/\r/g, "")));
          } catch {
            return showToast(
              "Failed to parse patches.json",
              getAssetIDByName("Small"),
            );
          }
        }),
      )
      .catch(() =>
        showToast("Failed to fetch patches.json", getAssetIDByName("Small")),
      );
  }, [patches]);
  React.useEffect(() => {
    commitsControllerRef.current?.abort();

    const controller = new AbortController();
    commitsControllerRef.current = controller;
    if (!commits)
      fetch(commitsURL, { cache: "no-store", signal: controller.signal })
        .then((x) =>
          x
            .json()
            .then((x) => setCommits(x))
            .catch(() =>
              showToast("Failed to parse commits", getAssetIDByName("Small")),
            ),
        )
        .catch(() =>
          showToast("Failed to fetch commits", getAssetIDByName("Small")),
        );
  }, [commits]);

  managePage({
    headerRight: () => <PreviewButton onPressExtra={forceUpdate} />,
  });
  React.useEffect(() => {
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
  ] as VendettaSysColors | null;

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
  else if (syscolors === null)
    showMessage = {
      error: false,
      message: "Dynamic colors are unavailable.",
      onPress: () => {},
    };

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
              showMessage.error ? "ic_warning_24px" : "ic_info_24px",
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
          <Text
            variant="text-md/semibold"
            color={showMessage.error ? "TEXT_DANGER" : "TEXT_BRAND"}
          >
            {showMessage.message}
            {showMessage.cta && (
              <RichText.Underline onPress={showMessage.onPress}>
                {showMessage.cta}
              </RichText.Underline>
            )}
          </Text>
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
                style={styles.labelIcon}
                resizeMode="cover"
              />
              <Text variant="text-md/semibold" color="TEXT_NORMAL">
                Autofill
              </Text>
            </Pressable>
          )}
          {syscolors && (
            <Text
              variant="text-md/semibold"
              color="TEXT_NORMAL"
              style={{ marginHorizontal: 5 }}
            >
              •
            </Text>
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
              style={styles.labelIcon}
              resizeMode="cover"
            />
            <Text variant="text-md/semibold" color="TEXT_NORMAL">
              Use Repainter theme
            </Text>
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

            const otter = vstorage.patches.from === "local" ? "git" : "local";
            showToast(
              `Switched to ${otter === "git" ? "GitHub" : "local"} patches`,
              getAssetIDByName("toast_invite_sent"),
            );
            vstorage.patches.from = otter;
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
                commit={
                  commits.find((x) => x.sha === vstorage.patches.commit) ??
                  commits[0]
                }
                onPress={() => openCommitsPage(navigation)}
                onLongPress={() =>
                  showSimpleActionSheet({
                    key: "CardOverflow",
                    header: {
                      title: "Patches",
                      onClose: () => LazyActionSheet.hideActionSheet(),
                    },
                    options: [
                      {
                        label: "Use latest commit as patches",
                        onPress: () => {
                          showToast("Using latest commit");
                          delete vstorage.patches.commit;
                        },
                      },
                    ],
                  })
                }
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
                <Text
                  variant="text-md/semibold"
                  color="TEXT_DANGER"
                  align="center"
                >
                  You got ratelimited by GitHub. Congrats!
                </Text>
                <Text
                  variant="text-md/semibold"
                  color="TEXT_DANGER"
                  align="center"
                  onPress={() => setCommits(undefined)}
                >
                  <RichText.Underline>Tap to retry</RichText.Underline>
                </Text>
              </View>
            )}
            <LineDivider addPadding={true} />
            <FormRow
              label="Load Theme"
              leading={<FormRow.Icon source={getAssetIDByName("debug")} />}
              onPress={async () => {
                let theme: ThemeDataWithPlus;
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
                  onConfirm: () => RNBundleUpdaterManager.reload(),
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
              }kB (using ${
                vstorage.patches.from === "local" ? "local" : "GitHub"
              })`}
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_sync_24px")} />
              }
              onPress={() => setPatches(undefined)}
            />
          </>
        )}
      </BetterTableRowGroup>
      <View style={{ height: 12 }} />
    </ScrollView>
  );
};
