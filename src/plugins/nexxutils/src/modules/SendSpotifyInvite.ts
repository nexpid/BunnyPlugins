import { findByTypeName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";

import InviteButton from "../components/modules/SendSpotifyInvite/InviteButton";
import { Module, ModuleCategory } from "../stuff/Module";

const MediaKeyboardListHeader = findByTypeName("MediaKeyboardListHeader");

export default new Module({
    id: "send-spotify-invite",
    label: "Send Spotify invite",
    sublabel: "Adds an option to send a Spotify Listen Along invite in chat",
    category: ModuleCategory.Useful,
    icon: getAssetIDByName("img_account_sync_spotify_white"),
    handlers: {
        onStart() {
            this.patches.add(
                after("type", MediaKeyboardListHeader, (_, ret) => {
                    return {
                        ...ret,
                        props: {
                            ...ret.props,
                            children: [
                                ...ret.props.children,
                                React.createElement(InviteButton, {}),
                            ],
                        },
                    };
                }),
            );
            // this.patches.add(
            //     // @ts-expect-error not in RN typings
            //     before("render", RN.Pressable.type, ([a]) => {
            //         if (a.accessibilityLabel === intlProxy.POLLS) {
            //             const [_, forceUpdate] = React.useReducer(x => ~x, 0);
            //             React.useEffect(() =>
            //                 fluxSubscribe("SPOTIFY_PLAYER_STATE", forceUpdate),
            //             );

            //             const disabled = !SpotifyStore.getActivity()?.party?.id;
            //             a.disabled = disabled;
            //             a.onPress = sendInvite;

            //             const textComp = findInReactTree(
            //                 a.children,
            //                 x =>
            //                     x.children === intlProxy.POLLS ||
            //                     x.children === "Invite",
            //             );
            //             if (textComp) {
            //                 textComp.children = "Invite";
            //                 textComp.style = [
            //                     styles.text,
            //                     disabled && styles.disabled,
            //                 ];
            //             }

            //             const iconComp = findInReactTree(
            //                 a.children,
            //                 x => x.props?.style?.tintColor,
            //             );
            //             if (iconComp) {
            //                 iconComp.type = () =>
            //                     React.createElement(RN.Image, {
            //                         source: getAssetIDByName(
            //                             "ic_spotify_white_16px",
            //                         ),
            //                         resizeMode: "cover",
            //                         style: [
            //                             iconComp.props.style,
            //                             disabled && styles.disabled,
            //                         ],
            //                     });
            //             } else console.log("Couldn't find icon :(");

            //             console.log("Update!");
            //         }
            //     }),
            // );
        },
        onStop() {},
    },
});
