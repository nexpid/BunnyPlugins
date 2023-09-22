import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

const LazyActionSheet = findByProps("openLazy", "hideActionSheet");

export let MessageEmojiActionSheet = findByProps("GuildDetails");

const unpatch = before("openLazy", LazyActionSheet, ([component, key]) => {
  if (key !== "MessageEmojiActionSheet") return;
  unpatch();

  component.then((module) => (MessageEmojiActionSheet = module));
});
