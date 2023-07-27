import { getAssetByID } from "@vendetta/ui/assets";
import { PlusStructure } from "../types";
import { matchTheme } from "../stuff/themeMatch";

export function getIconTint(plus: PlusStructure, icon: number): string {
  const name = getAssetByID(icon)?.name;
  if (!name) return;
  if (!plus.icons[name]) return;

  const colors = plus.icons[name];
  return matchTheme({
    dark: colors[0],
    light: colors[1],
    amoled: colors[2],
    darker: colors[3],
  });
}
