import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

const { ChatInput } = findByProps("ChatInput");

export default () => {
  let patch = after("render", ChatInput, (_, ret) => {
    // implement logic
  });

  return () => patch?.();
};
