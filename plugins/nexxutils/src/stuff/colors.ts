import { findByStoreName } from "@vendetta/metro";

const ThemeStore = findByStoreName("ThemeStore");

export const resolveCustomSemantic = (dark: string, light: string) =>
  ThemeStore.theme !== "light" ? dark : light;
export const lerp = (og: string, target: string, perc: number) => {
  const hex2rgb = (hex: string) =>
    hex.match(/\w\w/g)?.map((x) => parseInt(x, 16)) ?? [0, 0, 0];
  const rgb2hex = (rgb: number[]) =>
    `#${rgb.map((x) => x.toString(16).padStart(2, "0")).join("")}`;

  const ogR = hex2rgb(og);
  const targetR = hex2rgb(target);

  const result = ogR.map((ogC, i) =>
    Math.round(ogC + (targetR[i] - ogC) * perc)
  );

  return rgb2hex(result);
};
