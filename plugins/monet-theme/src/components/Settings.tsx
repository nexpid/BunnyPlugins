import {
  NavigationNative,
  ReactNative as RN,
  React,
  clipboard,
  stylesheet,
} from "@vendetta/metro/common";
import { Forms, General } from "@vendetta/ui/components";
import {
  BetterTableRowGroup,
  BetterTableRowTitle,
  LineDivider,
  RichText,
  SimpleText,
  SuperAwesomeIcon,
  VendettaSysColors,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import Color from "./Color";
import { commitsURL, devPatchesURL, patchesURL, vstorage } from "..";
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
import ThemePreview from "../../../../stuff/ThemePreview";

const { BundleUpdaterManager } = window.nativeModuleProxy;

const { ScrollView, View, Pressable } = General;
const { FormRow, FormSwitchRow } = Forms;

export type Patches = PatchV2 | PatchV3;
export interface PatchV2 {
  version: 2;
  replacers: PatchThing<[string, number]>;
  semantic: PatchThing<string>;
  raw: PatchThing<string>;
}
export interface PatchV3 {
  version: 3;
  replacers: PatchThing<{
    color: string;
    ratio?: number;
    base?: number;
  }>;
  semantic: PatchThing<string>;
  raw: PatchThing<string>;
}

export interface PatchThing<value> {
  dark: Record<string, value>;
  light: Record<string, value>;
  both: Record<string, value>;
}

const { TextStyleSheet } = findByProps("TextStyleSheet");
const mdSize = TextStyleSheet["text-md/semibold"].fontSize;
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
});

const setColorsFromDynamic = (clr: VendettaSysColors) => {
  vstorage.colors = {
    neutral1: clr.neutral1[7],
    neutral2: clr.neutral2[7],
    accent1: clr.accent1[7],
    accent2: clr.accent2[7],
    accent3: clr.accent3[7],
  };
};

export let stsCommits: CommitObj[];
export default (): React.JSX.Element => {
  const navigation = NavigationNative.useNavigation();
  const [commits, setCommits] = React.useState<CommitObj[] | undefined>(
    undefined
  );
  const [usePatches, setUsePatches] = React.useState<"git" | "local">("git");
  const [patches, setPatches] = React.useState<Patches | undefined>(undefined);
  stsCommits = commits;

  vstorage.lightmode ??= false;
  useProxy(vstorage);

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

  const unsub = navigation.addListener("focus", () => {
    unsub();
    navigation.setOptions({
      headerRight: () => (
        <SuperAwesomeIcon
          style="header"
          icon={getAssetIDByName("ic_report_message")}
          onPress={() => openPluginReportSheet("customrpc")}
        />
      ),
    });
  });

  let showMessage: {
    error: boolean;
    message: string;
    cta?: string;
    onPress: () => void;
  };

  const debug = getDebugInfo() as any;
  const syscolors = window[
    window.__vendetta_loader.features?.syscolors?.prop
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
      vstorage.colors = {
        neutral1: "#747679",
        neutral2: "#70777C",
        accent1: "#007FAC",
        accent2: "#657985",
        accent3: "#787296",
      };
    return <></>;
  }

  let lastThemePressTime = 0;
  return (
    <ScrollView>
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
                onConfirm: async (i) => {
                  const link = checkForURL(i);
                  if (!link) throw new Error("No Repainter link found!");

                  const theme = parseTheme(await fetchRawTheme(link));
                  vstorage.colors = theme.colors;
                  showToast("Imported", getAssetIDByName("toast_image_saved"));
                },
                confirmText: "Use",
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
            setCommits(undefined);
            setPatches(undefined);
          } else lastThemePressTime = Date.now() + 500;
        }}
      >
        {!patches ? (
          <RN.ActivityIndicator style={{ marginVertical: 125 }} size="small" />
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

                showConfirmationAlert({
                  title: "Reload required",
                  content:
                    "A reload is required to load this theme. Do you want to reload?",
                  confirmText: "Reload",
                  confirmColor: "red" as ButtonColors,
                  cancelText: "Cancel",
                  onConfirm: () => BundleUpdaterManager.reload(),
                });
              }}
            />
            <FormSwitchRow
              label={[
                "Light Theme",
                <View style={{ width: 10 }} />,
                <View style={styles.experimental}>
                  <SimpleText
                    variant="text-xs/semibold"
                    color="BACKGROUND_SECONDARY_ALT"
                  >
                    EXPERIMENTAL
                  </SimpleText>
                </View>,
              ]}
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
              }
              onValueChange={() => (vstorage.lightmode = !vstorage.lightmode)}
              value={vstorage.lightmode}
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
                setCommits(undefined);
                setPatches(undefined);
              }}
            />
          </>
        )}
      </BetterTableRowGroup>
      {patches && (
        <View style={{ marginVertical: 16, marginHorizontal: 16 }}>
          <BetterTableRowTitle
            title="Theme Preview"
            icon={getAssetIDByName("img_nitro_remixing")}
          />
          <ThemePreview
            theme={{
              theme: build(patches),
              origin: vstorage.lightmode ? "light" : "dark",
            }}
          />
        </View>
      )}
    </ScrollView>
  );
};
