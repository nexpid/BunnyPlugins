import { React } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { General } from "@vendetta/ui/components";

import {
  resolveSemanticColor,
  TextStyleSheet,
  TextStyleSheetVariant,
} from "../types";

const { Text } = General;

export default function SimpleText({
  variant,
  lineClamp,
  color,
  align,
  style,
  onPress,
  getChildren,
  children,
  liveUpdate,
}: React.PropsWithChildren<{
  variant?: TextStyleSheetVariant;
  lineClamp?: number;
  color?: string;
  align?: "left" | "right" | "center";
  style?: import("react-native").StyleProp<import("react-native").TextStyle>;
  onPress?: () => void;
  getChildren?: () => React.ReactNode | undefined;
  liveUpdate?: boolean;
}>) {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);

  React.useEffect(() => {
    if (!liveUpdate) return;
    const nextSecond = new Date().setMilliseconds(1000);

    let interval: any;
    const timeout = setTimeout(() => {
      forceUpdate();
      interval = setInterval(forceUpdate, 1000);
    }, nextSecond - Date.now());

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <Text
      style={[
        variant ? TextStyleSheet[variant] : {},
        color ? { color: resolveSemanticColor(semanticColors[color]) } : {},
        align ? { textAlign: align } : {},
        style ?? {},
      ]}
      numberOfLines={lineClamp}
      onPress={onPress}
    >
      {getChildren?.() ?? children}
    </Text>
  );
}
