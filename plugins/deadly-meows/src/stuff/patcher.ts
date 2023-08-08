import { findByProps, findByStoreName } from "@vendetta/metro";
import matchMeow from "./matchMeow";
import {
  FluxDispatcher,
  ReactNative as RN,
  i18n,
} from "@vendetta/metro/common";
import { isMeow } from "..";
import { showCustomAlert } from "@vendetta/ui/alerts";
import MeowAlert from "../components/alerts/MeowAlert";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";

const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const UserStore = findByStoreName("UserStore");

const { ChatInput } = findByProps("ChatInput");

const msgCallback = (data: {
  message: {
    content: string;
    author: { username: string; id: string };
    mentions: { id: string }[];
    state?: string;
  };
  optimistic: boolean;
  channelId: string;
  isPushNotification: boolean;
}) => {
  const current = UserStore.getCurrentUser();
  const shouldShow =
    data.channelId === SelectedChannelStore.getChannelId() ||
    data.message.mentions.find((x) => x.id === current.id);

  if (
    data.message.state === "SENDING" ||
    data.message.author.id !== current.id ||
    RN.AppState.currentState !== "active" ||
    !shouldShow
  )
    return;
  if (!matchMeow(data.message.content)) return;

  if (!isMeow.active && Date.now() > isMeow.cooldown)
    return showCustomAlert(MeowAlert, {
      whoMew: data.message.author.username,
    });
};

export default function () {
  const patches = new Array<() => void>();

  FluxDispatcher.subscribe("MESSAGE_CREATE", msgCallback);
  patches.push(() => FluxDispatcher.unsubscribe("MESSAGE_CREATE", msgCallback));

  patches.push(
    after("renderInput", ChatInput.prototype, (_, ret) => {
      const input = findInReactTree(ret, (x) => x?.type?.name === "ChatInput");

      if (input && isMeow.muted >= Date.now()) {
        input.props.editable = false;
        input.props.text = "";
        input.props.placeholder = i18n.Messages.READ_ONLY_CHANNEL;
      }
    })
  );

  return () => patches.forEach((x) => x());
}
