import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import CharCounter from "../components/CharCounter";

const { ChatInput } = findByProps("ChatInput");
const { MessagesWrapper } = findByProps("MessagesWrapper");

export let patches = [];

export default () => {
  patches.push(
    after("render", ChatInput.prototype, (_, ret) => {
      const props = findInReactTree(
        ret,
        (x) => typeof x?.placeholder === "string"
      );
      if (!props?.onChangeText) return;
      const children = findInReactTree(
        ret,
        (x) =>
          x?.type?.displayName === "View" && Array.isArray(x?.props?.children)
      )?.props?.children;
      if (!children) return console.log("no children");

      let thing: { runner: (txt: string) => void } = {
        runner: () => undefined,
      };
      props.onChangeText = (txt: string) => thing.runner(txt);

      children.unshift(<CharCounter thing={thing} />);
    })
  );

  patches.push(
    after("render", MessagesWrapper.prototype, (_, ret) => {
      const jump = findInReactTree(
        ret,
        (x) => typeof x?.props?.accessibilityLabel === "string"
      );
      if (!jump) return;

      patches.push(
        after("type", jump, (_, rat) => {
          if (rat?.props?.style) rat.props.style[1].bottom += 32;
        })
      );
    })
  );

  return () => {
    patches.forEach((x) => x());
    patches = [];
  };
};
