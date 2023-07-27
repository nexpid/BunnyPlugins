import { PlusStructure } from "../types";

export function getPlusData(): PlusStructure | undefined {
  const theme = window[
    window.__vendetta_loader?.features?.themes?.prop
  ] as Theme;
  if (!theme) return;

  //@ts-ignore
  return theme?.data?.plus;
}
