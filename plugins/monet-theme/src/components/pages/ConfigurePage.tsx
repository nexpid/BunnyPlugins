import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import SimpleText from "$/components/SimpleText";
import { openSheet, resolveSemanticColor } from "$/types";

import { vstorage } from "../..";
import wallpapers from "../../stuff/wallpapers";
import { stsPatches } from "../Settings";
import ChooseSheet from "../sheets/ChooseSheet";

const { View, ScrollView } = General;
const { FormRow } = Forms;

const readableThemeStyle = {
  auto: "Automatic",
  Automatic: "auto",
  dark: "Dark",
  Dark: "dark",
  light: "Light",
  Light: "light",
};

export const ConfigurePage = () => {
  useProxy(vstorage);

  const styles = stylesheet.createThemedStyleSheet({
    thing: {
      backgroundColor: semanticColors.BG_MOD_FAINT,
      borderRadius: 8,
      aspectRatio: 1 / 2,
    },
    thingActive: {
      backgroundColor: semanticColors.BG_MOD_STRONG,
    },
    emptyThing: {
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 8,
    },
    window: {
      height: "100%",
      backgroundColor: semanticColors.BG_BASE_SECONDARY,
    },
  });

  if (!stsPatches)
    return (
      <ScrollView style={styles.window}>
        <RN.ActivityIndicator size={"large"} style={{ flex: 1 }} />
      </ScrollView>
    );

  const bestVariant = vstorage.config.style;
  const collections = wallpapers.filter(
    (x) => x.variant === bestVariant || x.variant === "any",
  );

  const dims = RN.Dimensions.get("window");
  return (
    <ScrollView style={styles.window}>
      <BetterTableRowGroup
        title="Basic Config"
        icon={getAssetIDByName("ic_cog_24px")}
      >
        <FormRow
          label="Theme Style"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          trailing={
            <SimpleText variant="text-md/medium" color="TEXT_MUTED">
              {readableThemeStyle[vstorage.config.style]}
            </SimpleText>
          }
          onPress={() =>
            openSheet(ChooseSheet, {
              label: "Theme Style",
              value: readableThemeStyle[vstorage.config.style],
              choices: [
                readableThemeStyle.auto,
                readableThemeStyle.dark,
                readableThemeStyle.light,
              ],
              update: (v) =>
                vstorage.config &&
                (vstorage.config.style = readableThemeStyle[v]),
            })
          }
        />
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title="Backgrounds"
        icon={getAssetIDByName("ic_image")}
        padding={true}
      >
        {collections.map((x, i, a) => (
          <View style={{ marginBottom: i !== a.length - 1 ? 8 : 0 }}>
            <View style={{ marginBottom: 8 }}>
              <SimpleText variant="eyebrow" color="TEXT_NORMAL">
                {x.label}
              </SimpleText>
            </View>
            <ScrollView horizontal={true}>
              <View style={{ marginRight: 8, flexDirection: "column" }}>
                <RN.TouchableOpacity
                  onPress={() => {
                    showToast("Removed background", getAssetIDByName("Check"));
                    vstorage.config.wallpaper = "none";
                  }}
                  style={[
                    styles.thing,
                    vstorage.config.wallpaper === "none" && styles.thingActive,
                    styles.emptyThing,
                    {
                      width: dims.width / 4,
                    },
                  ]}
                >
                  <RN.Image
                    source={getAssetIDByName("img_none")}
                    style={{
                      width: "100%",
                      aspectRatio: 1 / 1,
                      tintColor: resolveSemanticColor(
                        semanticColors.TEXT_NORMAL,
                      ),
                    }}
                  />
                </RN.TouchableOpacity>
                <SimpleText
                  variant="text-sm/semibold"
                  color="TEXT_NORMAL"
                  align="center"
                  style={{ marginTop: 8 }}
                >
                  None
                </SimpleText>
              </View>
              {x.content.map((x) => (
                <View style={{ marginRight: 8, flexDirection: "column" }}>
                  <RN.TouchableOpacity
                    onPress={() => {
                      showToast(
                        `Set background to ${x.title}`,
                        getAssetIDByName("Check"),
                      );
                      vstorage.config.wallpaper = x.url;
                    }}
                    style={[
                      styles.thing,
                      vstorage.config.wallpaper === x.url && styles.thingActive,
                      {
                        width: dims.width / 4,
                      },
                    ]}
                  >
                    <RN.Image
                      source={{ uri: x.url }}
                      style={{
                        borderRadius: 8,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </RN.TouchableOpacity>
                  <SimpleText
                    variant="text-sm/semibold"
                    color="TEXT_NORMAL"
                    align="center"
                    style={{ marginTop: 8 }}
                  >
                    {x.title}
                  </SimpleText>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </BetterTableRowGroup>
      <View style={{ marginBottom: 12 }} />
    </ScrollView>
  );
};

export function openConfigurePage(navigation: any) {
  navigation.push("VendettaCustomPage", {
    title: "Theme Config",
    render: ConfigurePage,
  });
}
