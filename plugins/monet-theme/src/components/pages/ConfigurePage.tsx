import { Forms, General } from "@vendetta/ui/components";
import { stsPatches } from "../Settings";
import { migrateStorage, vstorage } from "../..";
import {
  ReactNative as RN,
  React,
  lodash,
  stylesheet,
} from "@vendetta/metro/common";
import {
  BetterTableRowGroup,
  SimpleText,
  openSheet,
} from "../../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import wallpapers from "../../stuff/wallpapers";
import { semanticColors } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import ChooseSettingSheet from "../../../../nexxutils/src/components/sheets/ChooseSettingSheet";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";

const { View, ScrollView } = General;
const { FormRow } = Forms;

export const ConfigurePage = () => {
  migrateStorage();
  useProxy(storage);

  const styles = stylesheet.createThemedStyleSheet({
    thing: {
      backgroundColor: semanticColors.BACKGROUND_TERTIARY,
    },
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 8,
    },
    window: {
      height: "100%",
      backgroundColor: semanticColors.BACKGROUND_MOBILE_PRIMARY,
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
    (x) => x.variant === bestVariant || x.variant === "any"
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
              {lodash.startCase(vstorage.config.style)}
            </SimpleText>
          }
          onPress={() =>
            openSheet(ChooseSettingSheet, {
              label: "Theme Style",
              value: lodash.startCase(vstorage.config.style),
              choices: ["Dark", "Light"],
              update: (v) => (vstorage.config.style = v.toLowerCase()),
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
              {x.content.map((x) => (
                <View style={{ marginRight: 8, flexDirection: "column" }}>
                  <RN.TouchableOpacity
                    onPress={() => {
                      showToast(
                        `Set background to ${x.title}`,
                        getAssetIDByName("Check")
                      );
                      vstorage.config.wallpaper = x.url;
                    }}
                    style={[
                      styles.thing,
                      {
                        borderRadius: 8,
                        width: dims.width / 4,
                        aspectRatio: 1 / 2,
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
