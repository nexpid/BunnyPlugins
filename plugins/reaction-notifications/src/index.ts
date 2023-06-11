import { FluxDispatcher } from "@vendetta/metro/common";
import settings, { vstorage } from "./settings";
import { ReactionEvent, User, getUserAvatar } from "../../../types";
import { findByProps, findByStoreName } from "@vendetta/metro";

const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const UserStore = findByStoreName("UserStore");
const MessageStore = findByStoreName("MessageStore");
const { jumpToMessage } = findByProps("jumpToMessage");
const { markdownToHtml } = findByProps("markdownToHtml");

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
  // somehow show notification
};

export default {
  onLoad: () =>
    FluxDispatcher.subscribe("MESSAGE_REACTION_ADD", reactionAddHandler),
  onUnload: () =>
    FluxDispatcher.unsubscribe("MESSAGE_REACTION_ADD", reactionAddHandler),
  settings: settings,
};
