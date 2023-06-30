import { React, stylesheet } from "@vendetta/metro/common";
import { SuperAwesomeIcon } from "../../../../stuff/types";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";

const { Pressable, View } = General;

export default ({
  thing,
}: {
  thing: { runner: (txt: string) => void };
}): React.JSX.Element => {
  const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
      // TODO get color
      color: "#FFFFFF",
      cornerRadius: 2147483647,
    },
    actionButton: {
      borderRadius: 2147483647,
      height: 40,
      width: 40,
      marginHorizontal: 4,
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      // TODO get color
      backgroundColor: "#FFFFFF",

      marginLeft: 8,
      marginTop: -8,
    },
    actionIcon: {
      // TODO get color
      tintColor: "#ffffff",
      width: 24,
      height: 24,
    },
  });

  const [text, setText] = React.useState("");

  thing.runner = (txt) => setText(txt);

  return (
    text.length > 0 && (
      <View
        style={{
          flexDirection: "row",
          position: "absolute",
          left: 0,
          top: -40,
          zIndex: 1,
        }}
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
          onPress={() => console.log("sex")}
          style={styles.actionButton}
          children={
            <SuperAwesomeIcon
              icon={getAssetIDByName("ic_eye")}
              style={styles.actionIcon}
            />
          }
        />
      </View>
    )
  );
};
