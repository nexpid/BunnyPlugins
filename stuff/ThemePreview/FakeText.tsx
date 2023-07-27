import { findByProps } from "@vendetta/metro";
import { General } from "@vendetta/ui/components";

const { TextStyleSheet } = findByProps("TextStyleSheet");
const { View } = General;

const smallChars = "iIjl ";

export default function ({
  size,
  variant,
  color,
  children,
}: React.PropsWithChildren<{
  size: "xxs" | "xs" | "sm" | "md" | "lg";
  variant: "normal" | "medium" | "semibold" | "bold";
  color: string;
}>) {
  const thing = TextStyleSheet[`text-${size}/${variant}`].fontSize * 0.5;
  const siz = children
    .toString()
    .split("")
    .reduce((a, b) => a + (smallChars.includes(b) ? 0.3 : 0.65), 0);

  return (
    <View
      style={{
        width: siz * thing,
        height: thing,
        backgroundColor: color,
        borderRadius: 2147483647,
        opacity: 0.85,
      }}
    />
  );
}
