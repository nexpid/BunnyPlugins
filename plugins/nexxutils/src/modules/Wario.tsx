import { React, ReactNative as RN } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { Module, ModuleCategory } from "../stuff/Module";

const aLenStuff = ".!,:tijl ".split("");
const aLen = (text: string) =>
  text.split("").reduce((p, x) => p + (aLenStuff.includes(x) ? 1 / 4 : 1), 0);

export default new Module({
  id: "wario",
  label: "Wario",
  sublabel: "Mama mia",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("wumpus-mario"),
  handlers: {
    onStart() {
      this.patches.add(
        before("render", RN.Image, ([x]) => {
          if (x.ignore) return;
          x.resizeMode = "stretch";
          x.source = {
            uri: "https://cdn.discordapp.com/attachments/919655852724604978/1197224092554772622/9k.png?ex=65ba7cd3&is=65a807d3&hm=802329bcd8341bb5e83c054cc7c42d9381f071d4f481fe666284dcdff01a0f2e&",
          };
          x.style = {
            ...RN.StyleSheet.flatten(x.style),
            tintColor: undefined,
          };
        }),
      );
      this.patches.add(
        before(
          "render",
          RN.Text,
          ([x]) => {
            const text = Array.isArray(x.children) ? x.children : [x.children];
            const len = text
              .filter((x) => typeof x === "string")
              .reduce((a: any, x: any) => a + aLen(x), 0);

            const style = RN.StyleSheet.flatten(x.style);
            x.children = React.createElement(RN.Image, {
              resizeMode: "stretch",
              source: {
                uri: "https://cdn.discordapp.com/attachments/919655852724604978/1197224092554772622/9k.png?ex=65ba7cd3&is=65a807d3&hm=802329bcd8341bb5e83c054cc7c42d9381f071d4f481fe666284dcdff01a0f2e&",
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
    },
    onStop() {},
  },
});
