import { General } from "@vendetta/ui/components";
import ThemePreview from "../../../../../stuff/ThemePreview";
import { build } from "../../stuff/buildTheme";
import { stsPatches } from "../Settings";
import { vstorage } from "../..";
import { ReactNative as RN, React, stylesheet } from "@vendetta/metro/common";
import {
  BetterTableRowGroup,
  BetterTableRowTitle,
  SimpleText,
} from "../../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import wallpapers from "../../stuff/wallpapers";
import { semanticColors } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";

const { View, ScrollView } = General;

const styles = stylesheet.createThemedStyleSheet({
  thing: {
    backgroundColor: semanticColors.BACKGROUND_TERTIARY,
  },
  androidRipple: {
    color: semanticColors.ANDROID_RIPPLE,
    cornerRadius: 8,
  },
});

export const ConfigurePage = () => {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);

  if (!stsPatches)
    return <RN.ActivityIndicator size={"large"} style={{ flex: 1 }} />;

  const bestVariant = vstorage.lightmode ? "light" : "dark";
  const collections = wallpapers.filter(
    (x) => x.variant === bestVariant || x.variant === "any"
  );

  const dims = RN.Dimensions.get("window");
  return (
    <ScrollView>
      <View style={{ marginTop: 8 }}>
        <View style={{ marginHorizontal: 16 }}>
          <BetterTableRowTitle
            title="Preview"
            icon={getAssetIDByName("ic_eye")}
          />
          <View style={{ alignItems: "center" }}>
            <ThemePreview
              theme={{
                theme: build(stsPatches),
                origin: vstorage.lightmode ? "light" : "dark",
              }}
            />
          </View>
        </View>
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
                        showToast(`Set background`, getAssetIDByName("Check"));
                        vstorage.wallpaper = x.url;
                        forceUpdate();
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
        <View style={{ marginBottom: 8 }} />
      </View>
    </ScrollView>
  );
};

export function openConfigurePage(navigation: any) {
  navigation.push("VendettaCustomPage", {
    title: "Theme Config",
    render: ConfigurePage,
  });
}
