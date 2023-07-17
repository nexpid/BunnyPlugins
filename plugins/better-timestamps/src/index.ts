import { findByProps } from "@vendetta/metro";
import settings from "./components/Settings";
import { before } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";

const MessageSender = findByProps("sendMessage", "receiveMessage");

export const vstorage: {
  reqBackticks?: boolean;
  reqMinutes?: boolean;
  alwaysLong?: boolean;
} = storage;

const isWhitespace = (x: string) => /^\s$/.test(x);

let unpatch;
export default {
  onLoad: () => {
    unpatch = before("sendMessage", MessageSender, (args) => {
      const message = args[1];
      let content = message?.content as string;
      if (typeof content !== "string" || typeof message !== "object") return;

      const j = vstorage.reqBackticks ? ["`", "`"] : ["(?:\\s|^)", "(?:\\s|$)"];

      const reg = {
        otN: "[0-9]{1,2}",
        tN: `[0-9]{2}`,
        abrv: "(?: ?(AM|PM))",
      };
      const regexes = [
        `(${reg.otN}:${reg.tN}:${reg.tN})${reg.abrv}?`,
        `(${reg.otN}:${reg.tN})${reg.abrv}?`,
        `(${reg.otN})${reg.abrv}`,
      ].map((x) => new RegExp(`${j[0]}${x}${j[1]}`, "gi"));

      for (const reg of regexes) {
        content = content.replace(reg, (str, time: string, abrv?: string) => {
          console.log(str);
          let [hours, minutes, seconds] = time
            .split(":")
            .map((x) => parseInt(x)) as [
            number,
            number | undefined,
            number | undefined
          ];

          if (hours < 0 || hours > 24) return str;
          if (typeof minutes === "number" && (minutes < 0 || minutes > 60))
            return str;
          if (typeof seconds === "number" && (seconds < 0 || seconds > 60))
            return str;

          // why tf does US time work this way
          if (abrv) {
            if (abrv.toLowerCase() === "pm" && hours !== 12) hours += 12;
            else if (abrv.toLowerCase() === "am" && hours === 12) hours = 0;
          }

          const date = new Date();
          date.setHours(hours, minutes ?? 0, seconds ?? 0, 0);

          return `${isWhitespace(str[0]) ? str[0] : ""}<t:${Math.floor(
            date.getTime() / 1000
          )}:${vstorage.alwaysLong ? "T" : "t"}>${
            isWhitespace(str[str.length - 1]) ? str[str.length - 1] : ""
          }`;
        });
      }

      message.content = content;
    });
  },
  onUnload: () => unpatch?.(),
  settings,
};
