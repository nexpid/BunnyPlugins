import { findByStoreName } from "@vendetta/metro";
import { plugins } from "@vendetta/plugins";

import { vstorage } from "..";

const UserStore = findByStoreName("UserStore");

export function display(length: number) {
  if (vstorage.display === "length") return prettify(length);
  else if (vstorage.display === "remaining")
    return prettify(getMessageLength() - length);
  else return `${prettify(length)}/${prettify(getMessageLength())}`;
}

// thanks rosie
export function prettify(x: number): string {
  if (vstorage.commas === false) return x.toString();
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
    vstorage.supportSLM !== false &&
    Object.values(plugins).find((x) => x.manifest.name === "SplitLargeMessages")
      ?.enabled
  );
}

export default function getMessageLength() {
  if (UserStore.getCurrentUser()?.premiumType === 2) return 4000;
  else return 2000;
}
