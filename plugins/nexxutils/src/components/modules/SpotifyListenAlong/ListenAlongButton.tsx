import { findByProps, findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Button, Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

const { View } = General;

const UserStore = findByStoreName("UserStore");
const SpotifyStore = findByStoreName("SpotifyStore");

const { play, sync } = findByProps("play", "sync");

const listenAlong =
  "https://cdn.discordapp.com/attachments/919655852724604978/1134238120771076226/listenAlong.png";

export default function ({
  button,
  activity,
  user,
}: {
  button: any;
  activity: any;
  user: { id: string };
}) {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  React.useEffect(() => {
    SpotifyStore.addChangeListener(forceUpdate);
    return () => SpotifyStore.removeChangeListener(forceUpdate);
  }, []);

  const def = <Button {...button} />;

  const swith = SpotifyStore.getSyncingWith();
  if (swith?.userId === user.id) return def;
  if (UserStore.getCurrentUser().id === user.id) return def;

  return (
    <>
      <View style={{ width: "100%", paddingRight: 30 + 8 }}>{def}</View>
      <View style={{ position: "absolute", right: 0 }}>
        <Button
          size="small"
          text=""
          style={[button.style, { width: 30 }]}
          renderIcon={() => <RN.Image source={{ uri: listenAlong }} />}
          onPress={() => {
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
      </View>
    </>
  );
}
