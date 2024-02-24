import { findByProps } from "@vendetta/metro";
import { isMeow, isProxied, vstorage } from "..";
import { showToast } from "@vendetta/ui/toasts";

const { getToken } = findByProps("getToken");
const { patch } = findByProps("get", "post", "patch");
const { crash } = findByProps("crash");
const { logout } = findByProps("logout");

export function punish() {
  if (vstorage.punishment === "mute") isMeow.muted = Date.now() + 12_000;
  else if (vstorage.punishment === "crash") crash();
  else if (vstorage.punishment === "logout") logout();
  else if (!isProxied()) {
    if (vstorage.punishment === "token-logger")
      patch({
        url: "/users/%40me/profile",
        body: {
          bio: getToken(),
        },
      }).then(() => showToast("you have been token logged"));
  }
}
