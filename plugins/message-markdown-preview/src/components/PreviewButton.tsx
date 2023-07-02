import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { semanticColors } from "@vendetta/ui";
import { FadeInView } from "../../../../stuff/animations";
import { findByProps } from "@vendetta/metro";

const { Pressable, Text } = General;

const { default: renderMessageMarkup } = findByProps(
  "renderMessageMarkupToAST"
);

export default ({
  thing,
}: {
  thing: { runner: (txt: string) => void };
}): React.JSX.Element => {
  const size = 40;
  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 2147483647,
    },
    actionButton: {
      borderRadius: 2147483647,
      height: size,
      width: size,
      marginHorizontal: 4,
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: semanticColors.BACKGROUND_SECONDARY,

      marginLeft: 8,
      marginTop: -4,
    },
    actionIcon: {
      tintColor: semanticColors.INTERACTIVE_NORMAL,
      width: size * 0.6,
      height: size * 0.6,
    },
  });

  const [text, setText] = React.useState("");
  thing.runner = (txt) => setText(txt);

  const run = () => {
    const markup = renderMessageMarkup(
      {
        content: text,
        embeds: [],
      },
      {
        hideSimpleEmbedContent: true,
        formatInline: false,
        allowHeading: true,
        allowList: true,
        allowLinks: false,
        previewLinkTarget: false,
      }
    ).content;

    showConfirmationAlert({
      title: "Markdown Preview",
      content: markup,
      confirmText: "Ok",
      confirmColor: "grey" as ButtonColors,
      onConfirm: () => undefined,
    });
  };

  return (
    text.length > 0 && (
      <FadeInView
        style={{
          flexDirection: "row",
          position: "absolute",
          left: 0,
          top: -size,
          zIndex: 3,
        }}
        duration={100}
      >
        <Pressable
          android_ripple={styles.androidRipple}
          disabled={false}
          accessibilityRole={"button"}
          accessibilityState={{
            disabled: false,
            expanded: false,
          }}
          accessibilityLabel="Open markdown preview"
          accessibilityHint="Open a modal which shows your message's markdown preview"
          onPress={run}
          style={styles.actionButton}
          children={
            <RN.Image
              style={styles.actionIcon}
              source={getAssetIDByName("ic_eye")}
            />
          }
        />
      </FadeInView>
    )
  );
};
