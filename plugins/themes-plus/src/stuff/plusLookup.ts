import { PlusStructure } from "../../../../stuff/typings";

export function getPlusData(): PlusStructure | false | undefined {
  const theme = window[window.__vendetta_loader?.features?.themes?.prop]
    ?.data as ThemeData;
  if (!theme) return false;

  //@ts-ignore self explanatory, plus is not apart of traditional ThemeData
  return theme?.plus;
}
