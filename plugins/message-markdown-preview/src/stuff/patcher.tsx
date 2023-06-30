import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import PreviewButton from "../components/PreviewButton";

const { ChatInput } = findByProps("ChatInput");

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
      if (!children) return;

      let thing: { runner: (txt: string) => void } = {
        runner: () => undefined,
      };
      if (props.onChangeText)
        props.onChangeText = (txt: string) => thing.runner(txt);
      else
        patches.push(
          after("onChangeText", props, ([txt]: [string]) => thing.runner(txt))
        );

      children.unshift(<PreviewButton thing={thing} />);
    })
  );

  return () => {
    patches.forEach((x) => x());
    patches = [];
  };
};
