import { findByStoreName } from "@vendetta/metro";

const ThemeStore = findByStoreName("ThemeStore");

export function matchTheme(colors: {
  dark?: string;
  light?: string;
  amoled?: string;
  darker?: string;
}): string | undefined {
  const theme = ThemeStore.theme;

  if (theme === "darker") return colors.darker ?? colors.dark;
  else if (theme === "amoled") return colors.amoled ?? colors.dark;
  else if (theme === "dark") return colors.dark;
  else if (theme === "light") return colors.light;
}
