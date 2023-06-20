import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";

interface props {
  onPress?: () => void;
  destructive?: boolean;
  icon: number;
  style: "header" | "card";
}

const styles = stylesheet.createThemedStyleSheet({
  headerStyleIcon: {
    marginRight: 10,
    tintColor: semanticColors.HEADER_PRIMARY,
  },
  cardStyleIcon: {
    width: 22,
    height: 22,
    marginLeft: 5,
    tintColor: semanticColors.INTERACTIVE_NORMAL,
  },
  destructiveIcon: {
    tintColor: semanticColors.TEXT_DANGER,
  },
});

export const SuperAwesomeIconEl = ({
  onPress,
  icon,
  style,
  destructive,
}: props) => (
  <RN.TouchableOpacity onPress={onPress}>
    <RN.Image
      style={[
        style === "header" ? styles.headerStyleIcon : styles.cardStyleIcon,
        destructive && styles.destructiveIcon,
      ].filter((x) => !!x)}
      source={icon}
    />
  </RN.TouchableOpacity>
);

export default ({ onPress, icon, style }: props) => {
  return () => {
    return <SuperAwesomeIconEl onPress={onPress} icon={icon} style={style} />;
  };
};
