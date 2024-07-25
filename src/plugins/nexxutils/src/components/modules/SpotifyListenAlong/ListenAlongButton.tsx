import { findByProps, findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Button } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { Svg } from "$/deps";

import listenAlong from "../../../../assets/SpotifyListenAlong/listenAlong.svg";
import listenAlong2 from "../../../../assets/SpotifyListenAlong/listenAlong2.svg";

const UserStore = findByStoreName("UserStore");
const SpotifyStore = findByStoreName("SpotifyStore");

const { play, sync } = findByProps("play", "sync");

export default function ({
    button,
    activity,
    user,
    redesigned,
}: {
    button: any;
    activity: any;
    user: { id: string };
    redesigned: boolean;
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
        disabled = "You're already syncing with this user.";
    if (UserStore.getCurrentUser().id === user.id)
        disabled = "Listen along with someone else, not yourself.";

    return (
        <>
            <RN.View style={{ width: "100%", paddingRight: 32 + 8 }}>{def}</RN.View>
            <RN.View style={{ position: "absolute", right: 0 }}>
                <Button
                    size="small"
                    text=""
                    style={[button.style, { width: 32 }, disabled && { opacity: 0.5 }]}
                    renderIcon={() => (
                        <Svg.SvgXml
                            width={20}
                            height={20}
                            xml={redesigned ? listenAlong2 : listenAlong}
                        />
                    )}
                    onPress={() => {
                        if (typeof disabled === "string") { showToast(disabled); return; }

                        showToast("Syncing", getAssetIDByName("Check"));
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
        </>
    );
}
