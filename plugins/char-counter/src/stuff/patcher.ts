import { findByProps } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { after, before } from "@vendetta/patcher";
import { createStorage, wrapSync } from "@vendetta/storage";
import { findInReactTree } from "@vendetta/utils";

import { vstorage } from "..";
import CharCounter from "../components/CharCounter";
import SimpleCharCounter from "../components/SimpleCharCounter";

const { ChatInput } = findByProps("ChatInput");
const { MessagesWrapper } = findByProps("MessagesWrapper");

export let patches = [];

let _lastText = {
  value: "",
};
export const lastText: typeof _lastText = wrapSync(
  createStorage({
    get: () => _lastText,
    set: (x: any) => {
      _lastText = x;
    },
  }),
);

export default () => {
  patches.push(
    after("render", ChatInput.prototype, (_, ret) => {
      const input = findInReactTree(
        ret.props.children,
        (x) => x?.type?.name === "ChatInput",
      );
      const props = input?.props;
      if (!props?.onChangeText) return;

      const children = findInReactTree(
        ret.props.children,
        (x) =>
          x?.type?.displayName === "View" && Array.isArray(x?.props?.children),
      )?.props?.children;
      if (!children) return;

      if (vstorage.position === "pill") {
        children.unshift(
          React.createElement(CharCounter, { inputProps: props }),
        );
      } else {
        patches.push(
          after(
            "onChangeText",
            props,
            ([txt]: [string]) => (lastText.value = txt),
          ),
        );
      }
    }),
  );

  patches.push(
    after("render", MessagesWrapper.prototype, (_, ret) => {
      const jump = findInReactTree(
        ret,
        (x) => x?.type?.name === "JumpToPresentButton",
      );
      if (!jump) return;

      patches.push(
        after("type", jump, (_, rat) => {
          if (rat?.props?.style && vstorage.position === "pill")
            rat.props.style[1].bottom += 32 + 8;
        }),
      );
    }),
  );

  patches.push(
    before("render", RN.View, (args) => {
      const cloned = [...args];
      const [x] = cloned;

      if (
        x.children?.[0]?.type?.name === "TextInputWrapper" &&
        vstorage.position === "inside"
      ) {
        const inside = x.children[1].props.children;
        inside[1].props.children = React.createElement(React.Fragment, {});
        inside.splice(1, 0, React.createElement(SimpleCharCounter, {}));
      }

      return cloned;
    }),
  );

  return () => {
    patches.forEach((x) => x());
    patches = [];
  };
};
