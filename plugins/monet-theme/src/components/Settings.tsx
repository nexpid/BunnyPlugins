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
  BetterTableRowTitle,
  LineDivider,
  RichText,
  SimpleText,
  SuperAwesomeIcon,
  VendettaSysColors,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import Color from "./Color";
import { commitsURL, patchesURL, vstorage } from "..";
import { createFileBackend, useProxy } from "@vendetta/storage";
import { showToast } from "@vendetta/ui/toasts";
import {
  showConfirmationAlert,
  showCustomAlert,
  showInputAlert,
} from "@vendetta/ui/alerts";
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

export interface PatchThing<value> {
  dark: Record<string, value>;
  light: Record<string, value>;
  both: Record<string, value>;
}
export interface Patches {
  replacers: PatchThing<[string, number]>;
  semantic: PatchThing<string>;
  raw: PatchThing<string>;
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
  const [patches, setPatches] = React.useState<Patches | undefined>(undefined);
  stsCommits = commits;

  vstorage.lightmode ??= false;
  useProxy(vstorage);

  React.useEffect(() => {
    if (!patches)
      fetch(patchesURL, { cache: "no-store" })
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

  navigation.setOptions({
    headerRight: () => (
      <SuperAwesomeIcon
        style="header"
        icon={getAssetIDByName("ic_report_message")}
        onPress={() => openPluginReportSheet("customrpc")}
      />
    ),
  });

  let showMessage: {
    error: boolean;
    message: string;
    cta?: string;
    onPress: () => void;
  };

  const debug = getDebugInfo() as any;
  const syscolors = window[
    window.__vendetta_loader.features.syscolors?.prop
  ] as VendettaSysColors | undefined;

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
  else if (!syscolors)
    showMessage = {
      error: true,
      message: "Dynamic colors not available. ",
      cta: "Fix",
      onPress: () =>
        showConfirmationAlert({
          title: "Enable Dynamic Colors",
          content:
            "To use dynamic colors, use nexx's modified VendettaXposed (until it gets merged to the normal XPosed module)",
          onConfirm: () =>
            url.openURL(
              "https://github.com/Gabe616/VendettaMod-VendettaXposed#readme"
            ),
          confirmText: "View on GitHub",
          cancelText: "Okay",
        }),
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
      >
        {!patches ? (
          <RN.ActivityIndicator style={{ flex: 1 }} />
        ) : (
          <>
            {!commits ? (
              <RN.ActivityIndicator style={{ flex: 1, paddingTop: 16 }} />
            ) : (
              <Commit
                commit={commits[0]}
                onPress={() => openCommitsPage(navigation)}
              />
            )}
            <LineDivider addPadding={true} />
            <FormRow
              label="Load Theme"
              leading={<FormRow.Icon source={getAssetIDByName("debug")} />}
              onPress={() => {
                let theme;
                try {
                  theme = build(patches);
                } catch (e) {
                  return showToast(e.toString(), getAssetIDByName("Small"));
                }

                showConfirmationAlert({
                  title: "Reload required",
                  content:
                    "A reload is required to load this theme. Do you want to reload?",
                  confirmText: "Reload",
                  confirmColor: "red" as ButtonColors,
                  cancelText: "Cancel",
                  onConfirm: async () => {
                    await createFileBackend("vendetta_theme.json").set({
                      id: id,
                      selected: true,
                      data: theme,
                    } as Theme);
                    BundleUpdaterManager.reload();
                  },
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
