import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";

import SimpleText from "$/components/SimpleText";

export default function (props: { content: any; source?: any; icon?: any }) {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      backgroundColor: semanticColors.CARD_PRIMARY_BG,
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

  const img = props.source ?? props.icon;
  const Content =
    typeof props.content === "function"
      ? props.content
      : () => props.content ?? null;
  const Image =
    img &&
    (typeof img === "function"
      ? img
      : () => (
          <RN.Image source={img} style={styles.icon} resizeMode="contain" />
        ));

  return (
    <RN.View style={[styles.container, styles.shadow]}>
      <SimpleText
        variant="text-md/semibold"
        color="TEXT_NORMAL"
        style={{ width: 280 }}
      >
        <Content />
      </SimpleText>
      {img && (
        <RN.View style={styles.iconContainer}>
          <Image />
        </RN.View>
      )}
    </RN.View>
  );
}
