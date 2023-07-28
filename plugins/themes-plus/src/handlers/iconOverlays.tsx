import { findByProps } from "@vendetta/metro";
import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { getAssetByID, getAssetIDByName } from "@vendetta/ui/assets";
import { rawColors, semanticColors } from "@vendetta/ui";
import { asIcon } from "./icons";
import { General } from "@vendetta/ui/components";
import { PlusStructure } from "../../../../stuff/typings";

const { View } = General;
const { MaskedBadge } = findByProps("MaskedBadge");

const styles = stylesheet.createThemedStyleSheet({
  maskPins: {
    position: "absolute",
    right: -10,
    bottom: -10,
    backgroundColor: semanticColors.BACKGROUND_SECONDARY,
  },
});
const innerCheck =
  "https://cdn.discordapp.com/attachments/919655852724604978/1134434803228344360/inner_check.png";

export function getIconOverlay(
  plus: PlusStructure,
  icon: number,
  style?: any[]
):
  | React.PropsWithChildren<{ style?: Record<string, any>; replace?: string }>
  | undefined {
  const ic = getAssetByID(icon)?.name;
  if (!ic) return;

  if (["ic_new_pins_light", "ic_new_pins"].includes(ic))
    return {
      replace: ic.includes("light") ? "icon-pins" : "ic_pins",
      children: (
        <View style={{ position: "absolute", right: 0, bottom: 0 }}>
          <MaskedBadge maskStyle={styles.maskPins} value={1} hideCount={true} />
        </View>
      ),
    };
  else if (
    [
      "ic_selection_checked_24px",
      "ic_radio_square_checked_24px",
      "ic_check",
      "ic_radio_circle_checked",
    ].includes(ic)
  )
    return {
      style: {
        tintColor: "#5865F2",
      },
      children: (
        <View style={{ position: "absolute", left: 0, top: 0 }}>
          {asIcon(
            plus,
            `${ic}__overlay`,
            <RN.Image
              source={{ uri: innerCheck }}
              style={[
                ...style,
                {
                  tintColor: "#FFF",
                },
              ]}
            />
          )}
        </View>
      ),
    };
  else if (
    ["app_installed_check", "ic_radio_circle_checked_green"].includes(ic)
  )
    return {
      style: {
        tintColor: "#3BA55C",
      },
      children: (
        <View style={{ position: "absolute", left: 0, top: 0 }}>
          {asIcon(
            plus,
            `${ic}__overlay`,
            <RN.Image
              source={{ uri: innerCheck }}
              style={[
                ...style,
                {
                  tintColor: "#FFF",
                },
              ]}
            />
          )}
        </View>
      ),
    };
}
