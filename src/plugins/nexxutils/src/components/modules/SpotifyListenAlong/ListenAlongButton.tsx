import { findByProps, findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { Button } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { resolveSemanticColor } from "$/types";

import UserPlayIcon from "../../../../assets/SpotifyListenAlong/UserPlayIcon.png";

const UserStore = findByStoreName("UserStore");
const SpotifyStore = findByStoreName("SpotifyStore");

const { play, sync } = findByProps("play", "sync");

export default function ({
    button,
    activity,
    user,
}: {
    button: any;
    activity: any;
    user: { id: string };
}) {
    const [_, forceUpdate] = React.useReducer(x => ~x, 0);
    React.useEffect(() => {
        SpotifyStore.addChangeListener(forceUpdate);
        return () => SpotifyStore.removeChangeListener(forceUpdate);
    }, []);

    const def = <Button {...button} />;

    let disabled: false | string = false;
    const swith = SpotifyStore.getSyncingWith();
    if (swith?.userId === user.id)
        disabled = "You're already listening along this user.";
    if (UserStore.getCurrentUser().id === user.id)
        disabled = "Listen along with someone else, not yourself.";

    return (
        <>
            <RN.View style={{ position: "absolute", left: 0 }}>
                <Button
                    size="small"
                    text=""
                    style={[
                        button.style,
                        { width: 32 },
                        disabled && { opacity: 0.5 },
                    ]}
                    renderIcon={() => (
                        <RN.Image
                            source={UserPlayIcon}
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: resolveSemanticColor(
                                    semanticColors.TEXT_NORMAL,
                                ),
                            }}
                        />
                    )}
                    onPress={() => {
                        if (typeof disabled === "string") {
                            showToast(disabled);
                            return;
                        }

                        if (!SpotifyStore.getActivity()) {
                            const x = () => {
                                SpotifyStore.removeChangeListener(x);
                                sync(activity, user.id);
                            };
                            SpotifyStore.addChangeListener(x);
                            play(activity, user.id);
                        } else sync(activity, user.id);
                    }}
                />
            </RN.View>
            <RN.View style={{ width: "100%", paddingLeft: 32 + 8 }}>
                {def}
            </RN.View>
        </>
    );
}
