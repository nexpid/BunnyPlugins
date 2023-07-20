import { findByProps, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { Button } from "@vendetta/ui/components";

const SpotifyStore = findByStoreName("SpotifyStore");
const { sync } = findByProps("play", "sync");

export default function ({
  background,
  activity,
  user,
}: {
  background: string;
  activity: any;
  user: { id: string };
}) {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  React.useEffect(() => {
    SpotifyStore.addChangeListener(forceUpdate);
    return () => SpotifyStore.removeChangeListener(forceUpdate);
  }, []);

  const swith = SpotifyStore.getSyncingWith();
  if (swith?.userId === user.id) return <></>;

  return (
    <Button
      text="Listen Along"
      style={{ backgroundColor: background, marginTop: 8 }}
      onPress={() => sync(activity, user.id)}
    />
  );
}
