import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";

export interface ThemePreviewData {
  theme: ThemeData;
  origin: PrevOrigin;
}
export const prevOrigins = ["dark", "light", "amoled"];
export type PrevOrigin = "dark" | "light" | "mpode";

export function semanticFromTheme(theme: ThemePreviewData, color: string) {
  const {
    SemanticColor,
    default: {
      meta: { resolveSemanticColor },
    },
  } = findByProps("SemanticColor");
  if (!semanticColors[color]) throw new Error(`Invalid color: ${color}`);
  if (!theme.theme) return resolveSemanticColor("dark", semanticColors[color]);

  if (theme.theme.semanticColors[color])
    return theme.theme.semanticColors[color][prevOrigins.indexOf(theme.origin)];
  const map = SemanticColor[color];
  if (map && theme.theme.rawColors[map[theme.origin].raw])
    return theme.theme.rawColors[map[theme.origin].raw];

  return resolveSemanticColor(theme.origin, semanticColors[color]);
}
