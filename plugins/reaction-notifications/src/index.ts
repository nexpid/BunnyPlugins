import { FluxDispatcher } from "@vendetta/metro/common";
import settings from "./components/Settings";
import { getUserAvatar } from "../../../stuff/types";
import { ReactionEvent, User } from "../../../stuff/typings";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";

const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const UserStore = findByStoreName("UserStore");
const MessageStore = findByStoreName("MessageStore");
const { jumpToMessage } = findByProps("jumpToMessage");
const { markdownToHtml } = findByProps("markdownToHtml");

export const vstorage = storage as Record<
  "reactions" | "superreactions" | "ignorebotreactions",
  boolean | undefined
>;

const reactionAddHandler = (reaction: ReactionEvent) => {
  if (!reaction.messageAuthorId) return;

  const user = UserStore.getCurrentUser() as User;
  if (SelectedChannelStore.getChannelId() === reaction.channelId) return;
  if (reaction.userId === user.id || reaction.messageAuthorId !== user.id)
    return;

  if (reaction.burst ? !vstorage.superreactions : !vstorage.reactions) return;

  const whoReacted = UserStore.getUser(reaction.userId) as User;
  if (!whoReacted) return;
  if (whoReacted.bot && vstorage.ignorebotreactions) return;

  const reactedMessage = MessageStore.getMessage(
    reaction.channelId,
    reaction.messageId
  );
  if (!reactedMessage) return;

  const emojiFormatted = reaction.emoji.id
    ? `:${reaction.emoji.name}:`
    : reaction.emoji.name;
  console.log("debug: send notification");
  // somehow show notification
};

export default {
  onLoad: () =>
    FluxDispatcher.subscribe("MESSAGE_REACTION_ADD", reactionAddHandler),
  onUnload: () =>
    FluxDispatcher.unsubscribe("MESSAGE_REACTION_ADD", reactionAddHandler),
  settings,
};
