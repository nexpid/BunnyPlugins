import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { Button, General } from "@vendetta/ui/components";

import { Redesign, resolveSemanticColor } from "$/types";

const { View } = General;

export default function RedesignButton(
  props: Parameters<typeof Redesign.Button>[0],
) {
  const styles = stylesheet.createThemedStyleSheet({
    buttonIcon: {
      width: 18,
      height: 18,
    },
  });

  const { variant, size, onPress, text, icon, style, disabled, loading } =
    props;
  if ("Button" in Redesign) return <Redesign.Button {...props} />;
  else {
    const dstyle = {
      primary: { look: "filled", color: "brand" },
      "primary-on-blurple": {
        look: "filled",
        color: "white",
      },
      "primary-alt": { look: "outlined", color: "brand" },
      "primary-alt-on-blurple": {
        look: "outlined",
        color: "white",
      },
      secondary: { look: "filled", color: "lightgrey" },
      "secondary-alt": { look: "filled", color: "grey" },
      "secondary-input": { look: "filled", color: "#000" },
      danger: { look: "filled", color: "red" },
      positive: { look: "filled", color: "green" },
    }[variant];

    return (
      <Button
        text={text}
        renderIcon={() => (
          <View
            style={{
              marginRight: 8,
            }}
          >
            {typeof icon === "object" && "type" in icon ? (
              icon
            ) : (
              <RN.Image
                source={icon}
                style={[
                  styles.buttonIcon,
                  {
                    tintColor: resolveSemanticColor(semanticColors.WHITE),
                  },
                ]}
                resizeMode="cover"
              />
            )}
          </View>
        )}
        size={
          {
            sm: "small",
            md: "medium",
            lg: "large",
          }[size]
        }
        look={dstyle.look}
        color={dstyle.color}
        onPress={onPress}
        style={style}
        disabled={disabled}
        loading={loading}
      />
    );
  }
}
