import { getDebugInfo } from "@vendetta/debug";
import { findByProps } from "@vendetta/metro";
import {
  clipboard,
  NavigationNative,
  React,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { showInputAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { safeFetch } from "@vendetta/utils";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import LineDivider from "$/components/LineDivider";
import { RichText } from "$/components/RichText";
import Text from "$/components/Text";
import { buttonVariantPolyfill } from "$/lib/redesign";
import { LazyActionSheet } from "$/types";
import { ThemeDataWithPlus, VendettaSysColors } from "$/typings";

import RepainterIcon from "../../assets/icons/RepainterIcon.png";
import {
  commitsURL,
  devPatchesURL,
  getSysColors,
  hasTheme,
  patchesURL,
  vstorage,
} from "..";
import { apply, build } from "../stuff/buildTheme";
import { parse } from "../stuff/jsoncParser";
import { checkForURL, fetchRawTheme, parseTheme } from "../stuff/repainter";
import { Patches } from "../types";
import Color from "./Color";
import Commit, { CommitObj } from "./Commit";
import { openCommitsPage } from "./pages/CommitsPage";
import { openConfigurePage } from "./pages/ConfigurePage";

const { ScrollView, View, Pressable } = General;
const { FormRow, FormSwitchRow } = Forms;
const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");
const IconButton = findByProps("IconButton").IconButton;

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

  const [commits, setCommits] = React.useState<CommitObj[] | undefined>(
    undefined,
  );
  const [patches, setPatches] = React.useState<Patches | undefined>(undefined);
  stsCommits = commits;
  stsPatches = patches;

  const [isLoadedTheme, setIsLoadedTheme] = React.useState(hasTheme());

  useProxy(vstorage);

  const styles = stylesheet.createThemedStyleSheet({
    pill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 4,
      backgroundColor: semanticColors.BG_MOD_SUBTLE,
      borderRadius: 8,
    },
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 8,
    } as any,
    help: {
      width: 16,
      height: 16,
      tintColor: semanticColors.TEXT_BRAND,
      marginRight: 4,
    },
    labelIcon: {
      width: 14,
      height: 14,
      marginRight: 6,
      tintColor: semanticColors.TEXT_NORMAL,
    },
  });

  React.useEffect(() => {
    safeFetch(
      vstorage.patches.from === "local" ? devPatchesURL : patchesURL(),
      {
        headers: { "cache-control": "public, max-age=120" },
      },
    )
      .then((x) =>
        x.text().then((text) => {
          try {
            setPatches(parse(text.replace(/\r/g, "")));
          } catch {
            return showToast(
              "Failed to parse color patches!",
              getAssetIDByName("Small"),
            );
          }
        }),
      )
      .catch(() =>
        showToast("Failed to fetch color patches!", getAssetIDByName("Small")),
      );
  }, [patches]);

  React.useEffect(() => {
    safeFetch(commitsURL, {
      headers: { "cache-control": "public, max-age=3600" },
    })
      .then((x) =>
        x
          .json()
          .then((x) => setCommits(x))
          .catch(() =>
            showToast(
              "Failed to parse GitHub commits!",
              getAssetIDByName("Small"),
            ),
          ),
      )
      .catch(() =>
        showToast("Failed to fetch GitHub commits!", getAssetIDByName("Small")),
      );
  }, [commits]);

  let showMessage: string;

  const debug = getDebugInfo() as any;
  const syscolors = getSysColors();

  if (debug.os.name !== "Android")
    showMessage = "Dynamic colors are only available on Android.";
  else if (debug.os.sdk < 31)
    showMessage = "Dynamic colors are only available on Android 12+ (SDK 31+).";
  else if (syscolors === null) showMessage = "Dynamic colors are unavailable.";

  let lastThemePressTime = 0;
  return (
    <ScrollView style={{ flex: 1 }}>
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
            source={getAssetIDByName("CircleInformationIcon")}
            style={styles.help}
          />
          <Text variant="text-md/semibold" color={"TEXT_BRAND"}>
            {showMessage}
          </Text>
        </View>
      )}
      <BetterTableRowGroup
        title="Colors"
        icon={getAssetIDByName("PaintPaletteIcon")}
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
              style={styles.pill}
              onPress={() => {
                setColorsFromDynamic(syscolors);
                showToast(
                  "Autofilled colors",
                  getAssetIDByName("PencilSparkleIcon"),
                );
              }}
            >
              <RN.Image
                source={getAssetIDByName("PencilSparkleIcon")}
                style={styles.labelIcon}
                resizeMode="cover"
              />
              <Text variant="text-sm/semibold" color="TEXT_NORMAL">
                Autofill
              </Text>
            </Pressable>
          )}
          {syscolors && (
            <Text
              variant="text-sm/semibold"
              color="TEXT_NORMAL"
              style={{ marginHorizontal: 6 }}
            >
              •
            </Text>
          )}
          <Pressable
            android_ripple={styles.androidRipple}
            style={styles.pill}
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

                  //@ts-expect-error Invalid type!!
                  showToast("Imported Repainter theme", { uri: RepainterIcon });
                },
                confirmColor: "brand" as ButtonColors,
                cancelText: "Cancel",
              });
            }}
          >
            <RN.Image
              source={{ uri: RepainterIcon }}
              style={styles.labelIcon}
              resizeMode="cover"
            />
            <Text variant="text-sm/semibold" color="TEXT_NORMAL">
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
        icon={getAssetIDByName("SettingsIcon")}
        padding={!patches}
        onTitlePress={() => {
          if (lastThemePressTime >= Date.now()) {
            lastThemePressTime = 0;

            const otter = vstorage.patches.from === "local" ? "git" : "local";
            showToast(
              `Switched to ${otter === "git" ? "GitHub" : "local"} patches`,
              getAssetIDByName("RetryIcon"),
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
                          showToast(
                            "Using latest commit",
                            getAssetIDByName("ThreadPlusIcon"),
                          );
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
                  You've been ratelimited by GitHub.
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
              leading={<FormRow.Icon source={getAssetIDByName("WrenchIcon")} />}
              trailing={
                <IconButton
                  onPress={() => apply(null) && setIsLoadedTheme(false)}
                  disabled={!isLoadedTheme}
                  size="sm"
                  variant={
                    isLoadedTheme
                      ? buttonVariantPolyfill().destructive
                      : "secondary"
                  }
                  icon={getAssetIDByName("TrashIcon")}
                />
              }
              onPress={async () => {
                let theme: ThemeDataWithPlus;
                try {
                  theme = build(patches);
                } catch (e) {
                  return showToast(e.toString(), getAssetIDByName("Small"));
                }

                if (apply(theme)) setIsLoadedTheme(true);
              }}
            />
            <FormRow
              label="Configure Theme"
              leading={
                <FormRow.Icon source={getAssetIDByName("SettingsIcon")} />
              }
              trailing={<FormRow.Arrow />}
              onPress={() => openConfigurePage(navigation)}
            />
            <FormSwitchRow
              label="Automatically Reapply Theme"
              subLabel="Automatically reapplies Monet Theme when you change your Discord color scheme or restart the app"
              leading={
                <FormRow.Icon source={getAssetIDByName("DownloadIcon")} />
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
                <FormRow.Icon source={getAssetIDByName("ActivitiesIcon")} />
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
