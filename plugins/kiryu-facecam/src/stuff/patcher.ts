import { findByProps } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";

import Kiryu, { openSet } from "../components/Kiryu";
import { sendAction } from "./frames";

const { ChatInput } = findByProps("ChatInput");

export default function () {
  const patches = new Array<() => void>();

  patches.push(
    after("render", RN.View, ([{ children, style }], ret) => {
      if (
        style &&
        Array.isArray(children) &&
        Object.keys(style).length === 2 &&
        style.flex === 1 &&
        style.overflow === "hidden" &&
        children.find((y: any) => y?.type?.name === "ChatViewConnected")
      ) {
        return React.createElement(
          React.Fragment,
          {},
          ret,
          React.createElement(Kiryu),
        );
      }
    }),
  );

  const kbHide = RN.Keyboard.addListener("keyboardDidHide", () =>
    openSet?.(false),
  );
  const kbShow = RN.Keyboard.addListener("keyboardDidShow", () =>
    openSet?.(true),
  );
  patches.push(() => {
    kbHide.remove();
    kbShow.remove();
  });

  patches.push(
    after("render", ChatInput.prototype, (_, ret) => {
      const input = findInReactTree(
        ret.props.children,
        (x) => x?.type?.name === "ChatInput",
      );
      const props = input?.props;
      if (!props?.onChangeText) return;

      patches.push(
        after("onChangeText", props, () =>
          sendAction(Math.random() < 0.5 ? "left" : "right"),
        ),
      );
    }),
  );

  return () => patches.forEach((x) => x());
}
