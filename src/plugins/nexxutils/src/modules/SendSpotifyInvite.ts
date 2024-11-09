import { findByProps, findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { findInReactTree } from "@vendetta/utils";

import intlProxy from "$/lib/intlProxy";
import { TextStyleSheet } from "$/types";

import { Module, ModuleCategory } from "../stuff/Module";

const SpotifyStore = findByStoreName("SpotifyStore");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");

const { sendMessage } = findByProps("sendMessage", "revealMessage");
const { getText, setText } = findByProps(
    "openSystemKeyboard",
    "getText",
    "setText",
);

const sendInvite = () => {
    const activity = SpotifyStore.getActivity();
    if (!activity?.party?.id) return;

    const channel = SelectedChannelStore.getChannelId();
    sendMessage(
        channel,
        {
            content: getText(channel),
            tts: false,
            invalidEmojis: [],
            validNonShortcutEmojis: [],
        },
        true,
        {
            activityAction: {
                activity,
                type: 3,
            },
        },
    );

    if (setText.length >= 2) setText(channel, "");
    else setText("");
};

const styles = stylesheet.createThemedStyleSheet({
    disabledIcon: {
        tintColor: semanticColors.INTERACTIVE_MUTED,
    },
    text: {
        ...TextStyleSheet["text-md/semibold"],
        color: semanticColors.TEXT_NORMAL,
    },
    disabledText: {
        color: semanticColors.TEXT_MUTED,
    },
});

export default new Module({
    id: "send-spotify-invite",
    label: "Send Spotify invite",
    sublabel: "Adds an option to send a Spotify Listen Along invite in chat",
    category: ModuleCategory.Useful,
    icon: getAssetIDByName("img_account_sync_spotify_white"),
    handlers: {
        onStart() {
            this.patches.add(
                // @ts-expect-error not in RN typings
                before("render", RN.Pressable.type, ([a]) => {
                    if (a.accessibilityLabel === intlProxy.CAMERA) {
                        const disabled = !SpotifyStore.getActivity()?.party?.id;
                        a.disabled = disabled;
                        a.onPress = sendInvite;

                        const textComp = findInReactTree(
                            a.children,
                            x => x.children === intlProxy.CAMERA,
                        );
                        if (textComp) {
                            textComp.children = "Spotify invite";
                            textComp.style = [
                                styles.text,
                                disabled && styles.disabledText,
                            ];
                        }

                        const iconComp = findInReactTree(a.children, x =>
                            x.props?.style?.find((y: any) => y?.tintColor),
                        );
                        if (iconComp)
                            iconComp.type = () =>
                                React.createElement(RN.Image, {
                                    source: getAssetIDByName(
                                        "ic_spotify_white_16px",
                                    ),
                                    resizeMode: "cover",
                                    style: [
                                        {
                                            width: 20,
                                            height: 20,
                                        },
                                        RN.StyleSheet.flatten(
                                            iconComp.props.style,
                                        ),
                                        disabled && styles.disabledIcon,
                                    ],
                                });
                    }
                }),
            );
        },
        onStop() {},
    },
});
