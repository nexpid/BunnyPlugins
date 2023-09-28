import listenAlong from "../../../../assets/SpotifyListenAlong/listenAlong.svg";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Button, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { SvgXml } from "../../../../../../stuff/types";

const { View } = General;

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
          renderIcon={() => <SvgXml width={20} height={20} xml={listenAlong} />}
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
