import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import Settings, { hosts } from "./settings";
import { patcher } from "@vendetta";

const sendMessage = findByProps("sendMessage", "receiveMessage");

let unpatch;

export default {
  onLoad: () => {
    unpatch = patcher.before("sendMessage", sendMessage, (args) => {
      const message = args[1];
      const content = message?.content;
      if (!message || !content || typeof message !== "object") return;

      const host = hosts.find((x) => storage.fxtwthost === x.id);
      if (!host) return;

      message.content = content.replace(
        /https?:\/\/(www\.)?twitter\.com/g,
        host.url
      );

      args[1] = message;
    });
  },
  onUnload: () => unpatch?.(),
  settings: Settings,
};
