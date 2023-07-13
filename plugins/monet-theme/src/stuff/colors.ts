import { rawColors } from "@vendetta/ui";
import { chroma } from "@vendetta/metro/common";
import { vstorage } from "..";

export function parseColor(clr: string): string | undefined {
  const shade = Number(clr.split("_")[1]);

  if (rawColors[clr]) return rawColors[clr];
  else if (clr.startsWith("N1_"))
    return getLABShade(vstorage.colors.neutral1!, shade);
  else if (clr.startsWith("N2_"))
    return getLABShade(vstorage.colors.neutral2!, shade);
  else if (clr.startsWith("A1_"))
    return getLABShade(vstorage.colors.accent1!, shade);
  else if (clr.startsWith("A2_"))
    return getLABShade(vstorage.colors.accent2!, shade);
  else if (clr.startsWith("A3_"))
    return getLABShade(vstorage.colors.accent3!, shade);
  else if (clr.match(/^#(?:[0-9a-f]{6})|(?:[0-9a-f]{3})$/)) return clr;
}

export function getLABShade(
  color: string,
  shade: number,
  mult?: number
): string {
  mult ??= 1;

  const lab = chroma.hex(color).lab();
  const diff = ((500 - shade) / 1000) * 2;
  lab[0] += lab[0] * diff * mult;
  return chroma.lab(...lab).hex();
}
/*
here lies the overcomplicated color parsing



export function getShade(color: string, shade: number): string {
  return `#${tinycolor(color).darken(shade).toHex()}`;
}
export function getDiscordShades(prefix: string): Record<string, number> {
  const original = rawColors[`${prefix}500`];
  if (!original) throw new Error("Invalid discord RawColor");
  const originalLight = tinycolor(original).toHsl().l;

  const shades: Record<string, number> = {};
  for (const x of Object.keys(rawColors).filter((x) => x.startsWith(prefix))) {
    const shade = Number(x.split("_")[1]);
    if (Number.isNaN(shade)) continue;

    const val = (originalLight - tinycolor(rawColors[x]).toHsl().l) * 100;
    shades[shade] = val;
  }

  return shades;
}

// from KieronQuinn/MonetCompat :P
export const LIGHTNESS_MAP = {
  0: 1.0,
  10: 0.9880873963836093,
  50: 0.9551400440214246,
  100: 0.9127904082618294,
  200: 0.8265622041716898,
  300: 0.7412252673769428,
  400: 0.653350946076347,
  500: 0.5624050605208273,
  600: 0.48193149058901036,
  700: 0.39417829080418526,
  800: 0.3091856317280812,
  900: 0.22212874192541768,
  1000: 0.0,
}

export const ACCENT1_CHROMA = 0.1328123146401862
export const ACCENT2_CHROMA = ACCENT1_CHROMA / 3
export const ACCENT3_CHROMA = ACCENT2_CHROMA * 2

export const NEUTRAL1_CHROMA = ACCENT1_CHROMA / 12
export const NEUTRAL2_CHROMA = NEUTRAL1_CHROMA * 2*/
