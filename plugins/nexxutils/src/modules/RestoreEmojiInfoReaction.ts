import { findByProps } from "@vendetta/metro";
import { i18n, ReactNative as RN } from "@vendetta/metro/common";
import { before, instead } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { findInReactTree } from "@vendetta/utils";

import { Module, ModuleCategory } from "../stuff/Module";

const { convertSurrogateToName } = findByProps("convertSurrogateToName");

export default new Module({
  id: "restore-emoji-info-reaction-picker",
  label: "Restore emoji info in reaction picker",
  sublabel:
    "Holding on an emoji in the reaction picker will show the emoji info (like it did in kotlin!)",
  category: ModuleCategory.Fixes,
  extra: {
    credits: ["492949202121261067"],
  },
  icon: getAssetIDByName("ReactionIcon"),
  handlers: {
    onStart() {
      const silly = new (findByProps("MessagesHandlers").MessagesHandlers)();

      this.patches.add(
        //@ts-expect-error not in RN typings
        before("render", RN.Pressable.type, ([a]) => {
          const emoji = findInReactTree(a, (x) => x?.type?.name === "Emoji");
          if (!emoji) return;
          const surr = emoji.props.surrogates;

          if (
            a?.accessibilityLabel?.includes(
              i18n.Messages.ADD_REACTION_NAMED.format({ emojiName: "" }),
            )
          ) {
            a.onLongPress = () => {
              instead(
                "isModalOrActionsheetObstructing",
                silly,
                () => false,
                true,
              );
              silly.handleTapEmoji({
                nativeEvent: {
                  node: {
                    surrogate: surr,
                    content: convertSurrogateToName(surr),
                  },
                },
              });
            };
          }
        }),
      );
    },
    onStop() {},
  },
});
