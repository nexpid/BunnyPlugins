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
  VendettaSysColors,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import Color from "./Color";
import { commitsURL, patchesURL, vstorage } from "..";
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

const { BundleUpdaterManager } = window.nativeModuleProxy;

const { ScrollView, View, Pressable } = General;
const { FormRow } = Forms;

export interface Patches {
  replacers: Record<string, [string, number]>;
  semantic: Record<string, string>;
  raw: Record<string, string>;
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
    fetchRawTheme(
      "https://repainter.app/themes/01G8B1Y6WH72151ZTQVWXP11KT"
    ).then((x) => {
      console.log(JSON.stringify(parseTheme(x)));
    });
  }, []);

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
              const link = checkForURL(await clipboard.getString());
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
          <Color title="Neutral 1" color={vstorage.colors.neutral1} />
          <Color title="Neutral 2" color={vstorage.colors.neutral2} />
          <Color title="Accent 1" color={vstorage.colors.accent1} />
          <Color title="Accent 2" color={vstorage.colors.accent2} />
          <Color title="Accent 3" color={vstorage.colors.accent3} />
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
