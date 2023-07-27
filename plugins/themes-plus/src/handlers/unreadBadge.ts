import { matchTheme } from "../stuff/themeMatch";
import { PlusStructure } from "../types";

export function getUnreadBadgeColor(plus: PlusStructure): string | undefined {
  if (!plus.unreadBadgeColor) return;

  const x = plus.unreadBadgeColor;
  return Array.isArray(x)
    ? matchTheme({
        dark: x[0],
        light: x[0],
        amoled: x[0],
        darker: x[0],
      })
    : x;
}
