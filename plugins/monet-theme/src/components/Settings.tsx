import {
  NavigationNative,
  ReactNative as RN,
  React,
  stylesheet,
  url,
} from "@vendetta/metro/common";
import { Forms, General } from "@vendetta/ui/components";
import {
  BetterTableRowGroup,
  LineDivider,
  RichText,
  SuperAwesomeIcon,
  VendettaSysColors,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import Color from "./Color";
import { commitsURL, patchesURL, vstorage } from "..";
import { createFileBackend, useProxy } from "@vendetta/storage";
import { showToast } from "@vendetta/ui/toasts";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { build } from "../stuff/buildTheme";
import Commit, { CommitObj } from "./Commit";
import { openCommitsPage } from "./pages/CommitsPage";
import { parse } from "../stuff/jsoncParser";
import { id } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";
import { getDebugInfo } from "@vendetta/debug";
import { openPluginReportSheet } from "../../../../stuff/githubReport";

const { BundleUpdaterManager } = window.nativeModuleProxy;

const { ScrollView, View, Text, Pressable } = General;
const { FormRow } = Forms;

export interface Patches {
  replacers: Record<string, [string, number]>;
  semantic: Record<string, string>;
  raw: Record<string, string>;
}

const { TextStyleSheet } = findByProps("TextStyleSheet");
const styles = stylesheet.createThemedStyleSheet({
  androidRipple: {
    color: semanticColors.ANDROID_RIPPLE,
    cornerRadius: 8,
  },
  warning: {
    ...TextStyleSheet["text-md/semibold"],
    color: semanticColors.TEXT_DANGER,
  },
  info: {
    ...TextStyleSheet["text-md/semibold"],
    color: semanticColors.TEXT_BRAND,
  },
  text: {
    ...TextStyleSheet["text-md/semibold"],
    color: semanticColors.TEXT_NORMAL,
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

  vstorage.colors ??= {
    neutral1: "#747679",
    neutral2: "#70777C",
    accent1: "#007FAC",
    accent2: "#657985",
    accent3: "#787296",
  };
  useProxy(vstorage);

  React.useEffect(() => {
    if (!patches)
      fetch(patchesURL, { cache: "no-store" })
        .then(async (x) => {
          try {
            const text = (await x.text()).replace(/\r/g, "");
            setPatches(parse(text));
          } catch {
            return showToast(
              "Failed to parse patches.json",
              getAssetIDByName("Small")
            );
          }
        })
        .catch(() =>
          showToast("Failed to fetch patches.json", getAssetIDByName("Small"))
        );
  }, [patches]);
  React.useEffect(() => {
    if (!commits)
      fetch(commitsURL, { cache: "no-store" }).then(async (x) => {
        try {
          const json = await x.json();
          setCommits(json);
        } catch {
          return showToast(
            "Failed to parse commits",
            getAssetIDByName("Small")
          );
        }
      });
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
              width: showMessage.error
                ? styles.warning.fontSize
                : styles.info.fontSize,
              height: showMessage.error
                ? styles.warning.fontSize
                : styles.info.fontSize,
              tintColor: showMessage.error
                ? styles.warning.color
                : styles.info.color,
              marginRight: 4,
            }}
          />
          <Text style={showMessage.error ? styles.warning : styles.info}>
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
              justifyContent: "center",
              marginBottom: 8,
            }}
            onPress={() => setColorsFromDynamic(syscolors)}
          >
            <RN.Image
              source={getAssetIDByName("img_nitro_remixing")}
              style={{
                width: styles.text.fontSize,
                height: styles.text.fontSize,
                tintColor: styles.text.color,
                marginRight: 4,
              }}
            />
            <Text style={styles.text}>Autofill</Text>
          </Pressable>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Color title="Neutral 1" color={vstorage.colors.neutral1} />
          <Color title="Neutral 2" color={vstorage.colors.neutral2} />
          <Color title="Accent 1" color={vstorage.colors.accent1} />
          <Color title="Accent 2" color={vstorage.colors.accent2} />
          <Color title="Accent 3" color={vstorage.colors.accent3} />
        </View>
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title="Theme"
        icon={getAssetIDByName("cog_24px")}
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
    </ScrollView>
  );
};
