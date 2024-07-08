import { findByName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { after, before } from "@vendetta/patcher";
import { id } from "@vendetta/plugin";
import { stopPlugin } from "@vendetta/plugins";
import { showToast } from "@vendetta/ui/toasts";

import { doHaptic } from "$/types";

const DCDChatManager = RN.NativeModules.DCDChatManager;
const BottomTabBarItem = findByName("BottomTabBarItem", false);

const aLenStuff = ".!,:tijl ".split("");
const aLen = (text: string) =>
  text.split("").reduce((p, x) => p + (aLenStuff.includes(x) ? 1 / 4 : 1), 0);

const wario =
  "https://cdn.discordapp.com/attachments/919655852724604978/1197224092554772622/9k.png?ex=65ba7cd3&is=65a807d3&hm=802329bcd8341bb5e83c054cc7c42d9381f071d4f481fe666284dcdff01a0f2e&";

type Iterable = {
  content: string | Iterable | Iterable[];
  [k: PropertyKey]: any;
};

export default function () {
  const patches = new Array<() => void>();

  patches.push(
    before("render", RN.Image, ([x]) => {
      if (x.ignore) return;
      x.resizeMode = "stretch";
      x.source = {
        uri: wario,
      };
      x.style = {
        ...RN.StyleSheet.flatten(x.style),
        tintColor: undefined,
      };
    }),
  );
  patches.push(
    before(
      "render",
      RN.Text,
      ([x]) => {
        const text = Array.isArray(x.children) ? x.children : [x.children];
        const len = text
          .filter((x: any) => typeof x === "string")
          .reduce((a: any, x: any) => a + aLen(x), 0);

        const style = RN.StyleSheet.flatten(x.style);
        x.children = React.createElement(RN.Image, {
          resizeMode: "stretch",
          source: {
            uri: wario,
          },
          style: {
            ...style,
            color: undefined,
            width: style.fontSize * len,
            height: style.fontSize,
          },
        });
      },
      true,
    ),
  );

  patches.push(
    before("updateRows", DCDChatManager, (args) => {
      const rows = JSON.parse(args[1]);

      for (const row of rows) {
        if (!row.message) continue;
        const { message } = row;

        const iterate = (thing: Iterable[]) => {
          const stuff = [];

          for (const x of thing) {
            if (typeof x.content === "string")
              for (let i = 0; i < Math.floor(aLen(x.content)); i++)
                stuff.push({
                  type: "guild",
                  guildId: "0",
                  content: "",
                  icon: wario,
                });
            else if (Array.isArray(x.content))
              stuff.push({
                ...x,
                content: iterate(x.content),
              });
            else stuff.push(x);
          }

          return stuff;
        };

        const editMessage = (msg: any) => {
          if (msg.content) msg.content = iterate(msg.content);

          for (const embed of msg.embeds ?? []) {
            if (embed.title) embed.title = iterate(embed.title);
            if (embed.description)
              embed.description = iterate(embed.description);
            if (embed.footer?.text || embed.footer?.content) {
              embed.footer.text = "wario";
              embed.footer.content = "wario";
            }
          }

          msg.username = "wario";
          msg.timestamp = "wario";
          msg.avatarURL = wario;
          delete msg.avatarDecorationURL;
        };

        editMessage(message);
        if (message.referencedMessage?.message)
          editMessage(message.referencedMessage.message);

        console.log(message);
      }

      args[1] = JSON.stringify(rows);
    }),
  );

  const gone = () => {
    doHaptic(50);
    stopPlugin(id, true);
    showToast("Wario is gone!");
  };

  // emergecny disable
  patches.push(
    after(
      "default",
      BottomTabBarItem,
      (
        [
          {
            route: { name },
          },
        ],
        ret,
      ) => {
        if (name !== "guilds") return ret;

        ret.props.onLongPress = gone;
        return ret;
      },
    ),
  );
  patches.push(
    //@ts-expect-error not in RN typings
    before("render", RN.Pressable.type, ([props]) => {
      if (props.accessibilityLabel === "Chat") {
        props.delayLongPress = 0;
        props.onLongPress = gone;
      }
    }),
  );

  return () => patches.forEach((x) => x());
}
