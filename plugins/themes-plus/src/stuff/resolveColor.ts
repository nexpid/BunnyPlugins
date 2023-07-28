import { findByStoreName } from "@vendetta/metro";
import { PlusColorResolvable } from "../../../../stuff/typings";
import { resolveSemanticColor } from "../../../../stuff/types";
import { rawColors, semanticColors } from "@vendetta/ui";

const UnsyncedUserSettingsStore = findByStoreName("UnsyncedUserSettingsStore");

export function matchTheme(colors: {
  dark?: string;
  light?: string;
  amoled?: string;
  darker?: string;
}): string | undefined {
  const theme = UnsyncedUserSettingsStore.useAMOLEDTheme;

  if (theme === 3) return colors.darker ?? colors.dark;
  else if (theme === 2) return colors.amoled ?? colors.dark;
  else if (theme === 1) return colors.light;
  else if (theme === 0) return colors.dark;
}

export default function (color: PlusColorResolvable): string | undefined {
  if (Array.isArray(color))
    return matchTheme({
      dark: color[0],
      light: color[1],
      amoled: color[2],
      darker: color[3],
    });
  else if (color.startsWith("SC_"))
    return semanticColors[color.slice(3)]
      ? resolveSemanticColor(semanticColors[color.slice(3)])
      : "#ffffff";
  else if (color.startsWith("RC_"))
    return rawColors[color.slice(3)] ?? "#ffffff";
  else if (color.startsWith("#") && color.length === 4)
    return `#${color[1].repeat(2)}${color[2].repeat(2)}${color[3].repeat(2)}`;
  else if (color.startsWith("#") && color.length === 7) return color;
}

export function androidifyColor(color: string, alpha = 255): number {
  const [_, r, g, b] = color.match(/#([A-F0-9]{2})([A-F0-9]{2})([A-F0-9]{2})/i);

  return (
    ((alpha & 0xff) << 24) |
    ((parseInt(r, 16) & 0xff) << 16) |
    ((parseInt(g, 16) & 0xff) << 8) |
    (parseInt(b, 16) & 0xff)
  );
}
