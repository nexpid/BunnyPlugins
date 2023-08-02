import { findByProps, findByTypeName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import PreviewButton from "../components/PreviewButton";
import openPreview from "./openPreview";
import { vstorage } from "..";
import { i18n } from "@vendetta/metro/common";

const { ChatInput } = findByProps("ChatInput");
const ChatInputActionButton = findByTypeName("ChatInputActionButton");

export const patches = [];

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

      if (vstorage.buttonType === "pill")
        children.unshift(<PreviewButton inputProps={props} />);
    })
  );

  // thank you rosie
  patches.push(
    after("type", ChatInputActionButton, ([a], ret) => {
      a?.accessibilityLabel === i18n.Messages.SEND &&
        ret.type?.render &&
        patches.push(
          after(
            "render",
            ret.type,
            (_, ret) => {
              ret.props &&
                (ret.props.onLongPress = () =>
                  vstorage.buttonType === "send" && openPreview());
            },
            true
          )
        );
    })
  );

  return () => patches.forEach((x) => x());
};
