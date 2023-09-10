import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { SimpleText } from "../../../../../../stuff/types";
import { resolveCustomSemantic } from "../../../stuff/colors";
import { rawColors } from "@vendetta/ui";

export default function ({
  content,
  source,
  icon,
}: {
  content: string;
  source?: number;
  icon?: number;
  context: any;
}) {
  const img: number = source ?? icon;

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      backgroundColor: resolveCustomSemantic(
        // these should be swapped but it just looks better this way
        rawColors.PRIMARY_600,
        rawColors.PRIMARY_100
      ),
      width: 344,
      minHeight: 48,
      borderRadius: 4,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
    },
    iconContainer: {
      alignSelf: "flex-end",
      width: 48,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    icon: {
      width: 24,
      height: 24,
    },
    shadow: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.58,
      shadowRadius: 16.0,

      elevation: 24,
    },
  });

  return (
    <RN.View style={[styles.container, styles.shadow]}>
      <SimpleText
        variant="text-md/semibold"
        color="TEXT_NORMAL"
        style={{ width: 280 }}
      >
        {content}
      </SimpleText>
      {img && (
        <RN.View style={styles.iconContainer}>
          <RN.Image source={img} style={styles.icon} resizeMode="contain" />
        </RN.View>
      )}
    </RN.View>
  );
}
