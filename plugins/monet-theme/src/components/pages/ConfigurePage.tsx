import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import Text from "$/components/Text";
import { resolveSemanticColor } from "$/types";

import { getDiscordTheme, vstorage } from "../..";
import wallpapers from "../../stuff/wallpapers";
import { stsPatches } from "../Settings";

const { View, ScrollView } = General;

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
    } as any,
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

  const bestVariant = getDiscordTheme() !== "light" ? "dark" : "light";
  const collections = wallpapers.filter(
    (x) => x.variant === bestVariant || x.variant === "any",
  );

  const dims = RN.Dimensions.get("window");
  return (
    <ScrollView style={styles.window}>
      <BetterTableRowGroup
        title="Backgrounds"
        icon={getAssetIDByName("ImageIcon")}
        padding={true}
      >
        {collections.map((x, i, a) => (
          <View style={{ marginBottom: i !== a.length - 1 ? 8 : 0 }}>
            <View style={{ marginBottom: 8 }}>
              <Text variant="eyebrow" color="TEXT_NORMAL">
                {x.label}
              </Text>
            </View>
            <ScrollView horizontal={true}>
              <View style={{ marginRight: 8, flexDirection: "column" }}>
                <RN.TouchableOpacity
                  onPress={() => {
                    showToast(
                      "Removed background",
                      getAssetIDByName("TrashIcon"),
                    );
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
                    source={getAssetIDByName("EyeSlashIcon")}
                    style={{
                      width: "100%",
                      aspectRatio: 1 / 1,
                      tintColor: resolveSemanticColor(
                        semanticColors.TEXT_NORMAL,
                      ),
                    }}
                  />
                </RN.TouchableOpacity>
                <Text
                  variant="text-sm/semibold"
                  color="TEXT_NORMAL"
                  align="center"
                  style={{ marginTop: 8 }}
                >
                  None
                </Text>
              </View>
              {x.content.map((x) => (
                <View style={{ marginRight: 8, flexDirection: "column" }}>
                  <RN.TouchableOpacity
                    onPress={() => {
                      showToast(
                        `Set background to ${x.title}`,
                        getAssetIDByName("ImagePlusIcon"),
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
                  <Text
                    variant="text-sm/semibold"
                    color="TEXT_NORMAL"
                    align="center"
                    style={{ marginTop: 8 }}
                  >
                    {x.title}
                  </Text>
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
