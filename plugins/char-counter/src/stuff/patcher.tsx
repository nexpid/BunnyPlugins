import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import CharCounter from "../components/CharCounter";

const { ChatInput } = findByProps("ChatInput");
const { MessagesWrapper } = findByProps("MessagesWrapper");

export let patches = [];

export default () => {
  patches.push(
    after("render", ChatInput.prototype, ([a], ret) => {
      const input = findInReactTree(
        ret.props.children,
        (x) => x?.type?.name === "ChatInput"
      );
      if (!input?.props?.onChangeText) return;

      const children = findInReactTree(
        ret.props.children,
        (x) =>
          x?.type?.displayName === "View" && Array.isArray(x?.props?.children)
      )?.props?.children;
      if (!children) return;

      children.unshift(<CharCounter inputProps={input.props} />);
    })
  );

  patches.push(
    after("render", MessagesWrapper.prototype, (_, ret) => {
      const jump = findInReactTree(
        ret,
        (x) => x?.type?.name === "JumpToPresentButton"
      );
      if (!jump) return;

      patches.push(
        after("type", jump, (_, rat) => {
          if (rat?.props?.style) rat.props.style[1].bottom += 32 + 8;
        })
      );
    })
  );

  return () => {
    patches.forEach((x) => x());
    patches = [];
  };
};
