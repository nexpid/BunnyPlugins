import { PlusStructure } from "../../../../stuff/typings";

export function getPlusData(): PlusStructure | undefined {
  const theme = window[
    window.__vendetta_loader?.features?.themes?.prop
  ] as Theme;
  if (!theme) return;

  //@ts-ignore self explanatory, plus is not apart of traditional ThemeData
  return theme?.data?.plus;
}
