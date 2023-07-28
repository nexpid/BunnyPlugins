import { before } from "@vendetta/patcher";
import { vstorage } from "..";
import { findByProps } from "@vendetta/metro";
import { parseRelative } from "./relative";

const MessageSender = findByProps("sendMessage", "editMessage");

const isWhitespace = (x: string) => /^\s$/.test(x);

const patchMessage = ([_, message]: any[]) => {
  let content = message?.content as string;
  if (typeof content !== "string" || typeof message !== "object") return;

  const j = (x: boolean) =>
    x ? ["`", "`"] : ["(?:\\s|\\t|^)", "(?:\\s|\\t|$)"];
  const jTime = j(vstorage.time?.requireBackticks);
  const jDate = j(vstorage.day?.requireBackticks);

  if (vstorage.time) {
    const reg = {
      otN: "[0-9]{1,2}",
      tN: `[0-9]{2}`,
      abrv: "(?: ?(AM|PM))",
    };
    const regexes = [
      `(${reg.otN}:${reg.tN}:${reg.tN})${reg.abrv}?`,
      `(${reg.otN}:${reg.tN})${reg.abrv}?`,
      `(${reg.otN})${reg.abrv}`,
    ].map((x) => new RegExp(`${jTime[0]}${x}${jTime[1]}`, "gi"));

    for (const reg of regexes) {
      content = content.replace(reg, (str, time: string, abrv?: string) => {
        let [hours, minutes, seconds] = time
          .split(":")
          .map((x) => Number(x)) as [
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
        )}:${date.getSeconds() === 0 ? "t" : "T"}>${
          isWhitespace(str[str.length - 1]) ? str[str.length - 1] : ""
        }`;
      });
    }
  }

  if (vstorage.day) {
    const reg = {
      otN: "[0-9]{1,2}",
      tN: "[0-9]{2}",
      fN: "[0-9]{4}",
    };
    const regexes = [
      `(${reg.otN})\\/(${reg.otN})\\/(${reg.fN}|${reg.tN})`,
      `(${reg.otN})\\/(${reg.otN})`,
    ].map((x) => new RegExp(`${jDate[0]}${x}${jDate[1]}`, "gi"));

    for (const reg of regexes) {
      content = content.replace(
        reg,
        (str, rday: string, rmonth: string, ryear?: string) => {
          const curY = new Date().getFullYear();
          let [day, month, year] = [
            Number(rday),
            Number(rmonth),
            ryear ? Number(ryear) : curY,
          ];

          if (vstorage.day.american) {
            const t = month;
            month = day;
            day = t;
          }

          if (day < 0 || day > 31) return str;
          if (month < 0 || month > 12) return str;
          if (year < 0 || year > 9999) return str;

          if (year < 100) year += 2000;

          const date = new Date(0);
          date.setFullYear(year, month - 1, day);

          return `${isWhitespace(str[0]) ? str[0] : ""}<t:${Math.floor(
            date.getTime() / 1000
          )}:d>${isWhitespace(str[str.length - 1]) ? str[str.length - 1] : ""}`;
        }
      );
    }
  }

  content = parseRelative(
    {
      time: !!vstorage.time?.acceptRelative,
      date: !!vstorage.day?.acceptRelative,
    },
    {
      time: !!vstorage.time?.requireBackticks,
      date: !!vstorage.day?.requireBackticks,
    },
    content,
    (str, tim) => {
      return `${isWhitespace(str[0]) ? str[0] : ""}<t:${Math.floor(
        (Date.now() + tim) / 1000
      )}:R>${isWhitespace(str[str.length - 1]) ? str[0] : ""}`;
    }
  );

  message.content = content;
};

export default function (): () => void {
  const patches = new Array<() => void>();
  patches.push(before("sendMessage", MessageSender, patchMessage));
  patches.push(before("editMessage", MessageSender, patchMessage));

  return () => patches.forEach((x) => x());
}
