import { findByName } from "@vendetta/metro";
import { i18n, React } from "@vendetta/metro/common";
import { after, before } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { findInReactTree } from "@vendetta/utils";

import { LazyActionSheet, SuperAwesomeIcon } from "../../../../stuff/types";
import PinMessageLocallyAction from "../components/MessageActionSheetButton";
import ChannelPinsModal from "../components/modals/ChannelPinsModal";

const { View } = General;
const ChannelSettingsModal = findByName("ChannelSettingsModal", false);
const ChannelPinsConnected = findByName("ChannelPinsConnected", false);

let chPinsHRCb: {
  filters?: () => void;
  clear?: () => void;
} = {};
export function setChPinsHRCb(x: typeof chPinsHRCb) {
  chPinsHRCb = x;
}

export const chPinsMessagesOverwrites: Record<
  string,
  (messages: any[]) => any[]
> = {};

export default function () {
  const patches = new Array<() => void>();

  patches.push(
    after("default", ChannelPinsConnected, (_, pins) => {
      const { channelId, loaded, messages } = pins.props;
      return {
        ...pins,
        props: {
          ...pins.props,
          messages:
            loaded && messages
              ? chPinsMessagesOverwrites[channelId]?.(messages) ?? messages
              : messages,
        },
      };
    }),
  );

  patches.push(
    before("openLazy", LazyActionSheet, ([component, key, msg]) => {
      const message = msg?.message;
      if (key !== "MessageLongPressActionSheet" || !message) return;

      component.then((i) => {
        const unp = after("default", i, (_, comp) => {
          React.useEffect(
            () => () => {
              unp();
            },
            [],
          );

          const buttons = findInReactTree(
            comp,
            (x) => x?.[0]?.type?.name === "ButtonRow",
          );
          if (!buttons) return comp;

          const at = Math.max(
            buttons.findIndex(
              (x) => x.props.message === i18n.Messages.MARK_UNREAD,
            ),
            0,
          );
          buttons.splice(
            at,
            0,
            React.createElement(PinMessageLocallyAction, message),
          );
        });
      });
    }),
  );

  patches.push(
    after("default", ChannelSettingsModal, (_, navigator) => {
      const screens = navigator.props.screens;

      screens.PINNED_MESSAGES.headerRight = () =>
        React.createElement(
          View,
          {
            style: { flexDirection: "row-reverse" },
          },
          React.createElement(SuperAwesomeIcon, {
            icon: getAssetIDByName("ic_filter"),
            style: "header",
            onPress: () => chPinsHRCb.filters?.(),
          }),
          React.createElement(SuperAwesomeIcon, {
            icon: getAssetIDByName("ic_message_delete"),
            style: "header",
            destructive: true,
            onPress: () => chPinsHRCb.clear?.(),
          }),
        );

      patches.push(
        after("render", screens.PINNED_MESSAGES, (_, ret) =>
          React.createElement(ChannelPinsModal, {
            channelId: ret.props.channelId,
          }),
        ),
      );
    }),
  );

  return () => patches.forEach((x) => x());
}
