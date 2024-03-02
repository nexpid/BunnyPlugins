import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

import { BetterTableRowGroup } from "$/components/BetterTableRow";
import { Reanimated } from "$/deps";

import kazuma from "../../assets/kazuma.png";
import { lang, vstorage } from "..";
import { kyrDt, kyriuStyles } from "./Kiryu";

const { FormRow, FormRadioRow, FormSwitchRow } = Forms;

const rem = (rad: number) => rad * 16;
const height = Math.floor(rem((kyrDt.h / kyrDt.w) * 15));

export function SettingsKyriu() {
  useProxy(vstorage);

  const posVal = Reanimated.useSharedValue(
    vstorage.appearStyle === "fly" ? -height - 15 : 0,
  );
  const opVal = Reanimated.useSharedValue(
    vstorage.appearStyle === "fly" ? 1 : 0,
  );
  const rotVal = Reanimated.useSharedValue(
    vstorage.swinging ? "-5deg" : "0deg",
  );
  const scaleVal = Reanimated.useSharedValue(1);

  React.useEffect(() => {
    posVal.value = vstorage.appearStyle === "fly" ? -height - 15 : 0;
    opVal.value = vstorage.appearStyle === "fly" ? 1 : 0;
    rotVal.value = vstorage.swinging ? "-5deg" : "0deg";

    if (vstorage.appearStyle === "fly")
      posVal.value = Reanimated.withTiming(0, {
        duration: 600,
        easing: Reanimated.Easing.out(Reanimated.Easing.back(1.5)),
      });
    else
      opVal.value = Reanimated.withTiming(1, {
        duration: 222,
      });

    if (vstorage.swinging)
      rotVal.value = Reanimated.withRepeat(
        Reanimated.withTiming("5deg", {
          duration: 900,
        }),
        -1,
        true,
      );

    if (vstorage.bounce)
      scaleVal.value = Reanimated.withRepeat(
        Reanimated.withSequence(
          Reanimated.withDelay(
            500,
            Reanimated.withTiming(1.05, { duration: 0 }),
          ),
          Reanimated.withTiming(1, {
            duration: 90,
          }),
        ),
        -1,
        true,
      );
    else scaleVal.value = 1;
  });

  return (
    <Reanimated.default.View
      style={[
        kyriuStyles.frame,
        {
          marginTop: posVal,
          opacity: opVal,
          transform: [{ rotate: rotVal }, { scale: scaleVal }],
        },
      ]}
    >
      <RN.Image
        source={{ uri: kazuma }}
        style={kyriuStyles.empty}
        resizeMode="stretch"
      />
    </Reanimated.default.View>
  );
}

export default function Settings() {
  useProxy(vstorage);

  const styles = stylesheet.createThemedStyleSheet({
    preview: {
      height: height + 32,
      paddingTop: 16,

      marginHorizontal: 16,
      backgroundColor: semanticColors.BG_MOD_SUBTLE,
      borderRadius: 8,
      borderWidth: 4,
      borderColor: semanticColors.BG_MOD_SUBTLE,
      borderStyle: "dotted",

      flexDirection: "row",
      justifyContent: "center",

      overflow: "hidden",
    },
  });

  vstorage.appearStyle;

  return (
    <RN.ScrollView style={{ flex: 1 }}>
      <RN.View style={styles.preview} pointerEvents="none">
        <SettingsKyriu />
      </RN.View>
      <BetterTableRowGroup
        title={lang.format("settings.title", {})}
        icon={getAssetIDByName("ic_cog_24px")}
      >
        <FormRow
          label={lang.format("settings.appear_style.title", {})}
          subLabel={lang.format("settings.appear_style.description", {})}
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
        />
        <FormRadioRow
          label={lang.format("settings.appear_style.fly", {})}
          onPress={() => (vstorage.appearStyle = "fly")}
          trailing={<FormRow.Arrow />}
          selected={vstorage.appearStyle === "fly"}
          style={{ marginHorizontal: 12 }}
        />
        <FormRadioRow
          label={lang.format("settings.appear_style.fade", {})}
          onPress={() => (vstorage.appearStyle = "fade")}
          trailing={<FormRow.Arrow />}
          selected={vstorage.appearStyle === "fade"}
          style={{ marginHorizontal: 12 }}
        />
        <FormSwitchRow
          label={lang.format("settings.facecam_swinging", {})}
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          onValueChange={() => (vstorage.swinging = !vstorage.swinging)}
          value={vstorage.swinging}
        />
        <FormSwitchRow
          label={lang.format("settings.facecam_bouncing", {})}
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          onValueChange={() => (vstorage.bounce = !vstorage.bounce)}
          value={vstorage.bounce}
        />
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
