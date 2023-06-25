import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import getMessageLength, { stringify } from "./getMessageLength";

const { ChatInput } = findByProps("ChatInput");

export let patches = [];

export default () => {
  patches.push(
    after("render", ChatInput.prototype, (_, ret) => {
      const props = findInReactTree(
        ret,
        (x) => typeof x?.onChangeText === "function"
      );
      if (!props?.onChangeText) return;

      patches.push(
        after("onChangeText", props, ([txt]: [string]) => {
          console.log(`${txt.length}/${stringify(getMessageLength())}`);
        })
      );
    })
  );

  return () => {
    patches.forEach((x) => x());
    patches = [];
  };
};
