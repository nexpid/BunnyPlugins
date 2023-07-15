import { findByStoreName } from "@vendetta/metro";
import { plugins } from "@vendetta/plugins";
import { vstorage } from "..";

const UserStore = findByStoreName("UserStore");

// thanks rosie
export function prettify(x: number): string {
  if (!vstorage.commas) return x.toString();
  else
    return x
      .toString()
      .split("")
      .reverse()
      .map((x, i, a) => (i % 3 === 0 && a.length > 3 && i !== 0 ? `${x},` : x))
      .reverse()
      .join("");
}

export function hasSLM() {
  return !!(
    vstorage.supportSLM &&
    Object.values(plugins).find((x) => x.manifest.name === "SplitLargeMessages")
      ?.enabled
  );
}

export default () => {
  if (UserStore.getCurrentUser()?.premiumType === 2) return 4000;
  else return 2000;
};
