import { HTTP_REGEX_MULTI } from "@vendetta/constants";
import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

import { getRules } from "./rules";

const Messages = findByProps("sendMessage", "editMessage");

const clean = (text: string) =>
  text.replace(HTTP_REGEX_MULTI, (str) => {
    let url: URL;
    try {
      url = new URL(str);
    } catch {
      return str;
    }

    const rules = getRules();

    const host =
      Object.entries(rules.byHost).find((x) =>
        rules.hostMap[x[0]]?.test(url.hostname),
      )?.[1] ?? [];

    for (const r of [...rules.universal, ...host]) {
      url.searchParams.forEach(
        (_, key) => r.test(key) && url.searchParams.delete(key),
      );
    }

    return url.toString();
  });

const handleMessage = (msg: any) => {
  msg.content = clean(msg.content);
};

export default function () {
  const patches = new Array<() => void>();

  before("sendMessage", Messages, (args) => handleMessage(args[1]));
  before("editMessage", Messages, (args) => handleMessage(args[2]));

  getRules();

  return () => patches.forEach((x) => x());
}
