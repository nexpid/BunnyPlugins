import { findByProps } from "@vendetta/metro";
import { isMeow, vstorage } from "..";

const { crash } = findByProps("crash");
const { logout } = findByProps("logout");

export function punish() {
  if (vstorage.punishment === "mute") isMeow.muted = Date.now() + 12_000;
  else if (vstorage.punishment === "crash") crash();
  else if (vstorage.punishment === "logout") logout();
}
