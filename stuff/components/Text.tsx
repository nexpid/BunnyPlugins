import { React, ReactNative as RN } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { type StyleProp, type TextStyle } from "react-native";

import {
  resolveSemanticColor,
  TextStyleSheet,
  TextStyleSheetVariant,
} from "../types";

export function TrailingText({ children }: React.PropsWithChildren<object>) {
  return (
    <Text variant="text-md/medium" color="TEXT_MUTED">
      {children}
    </Text>
  );
}

export default function Text({
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
  style?: StyleProp<TextStyle>;
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
    <RN.Text
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
    </RN.Text>
  );
}
