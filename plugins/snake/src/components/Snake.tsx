import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { EventsContext, GameContext } from "./App";
import { GameStatePlayerRotation } from "../stuff/types";

const rotations = {
  [GameStatePlayerRotation.Right]: 0,
  [GameStatePlayerRotation.Down]: 90,
  [GameStatePlayerRotation.Left]: 180,
  [GameStatePlayerRotation.Up]: 270,
};

export default function Snake() {
  const game = React.useContext(GameContext);
  const events = React.useContext(EventsContext);

  const posX = React.useRef(new RN.Animated.Value(game.state.player.x)).current;
  const posY = React.useRef(new RN.Animated.Value(game.state.player.y)).current;

  const rot = React.useRef(
    new RN.Animated.Value(rotations[game.state.player.rot])
  ).current;

  React.useEffect(
    () =>
      events.listen("reload", () => {
        posX.setValue(game.state.player.x);
        posY.setValue(game.state.player.y);
        rot.setValue(rotations[game.state.player.rot]);
      }).remove
  );

  // React.useEffect(() => {
  //   RN.Animated.timing(posX, {
  //     toValue: game.state.player.x,
  //     duration: game.settings.speed,
  //     easing: RN.Easing.linear,
  //     useNativeDriver: false,
  //   }).start();
  // }, [game.state.player.x]);

  // React.useEffect(() => {
  //   RN.Animated.timing(posY, {
  //     toValue: game.state.player.y,
  //     duration: game.settings.speed,
  //     easing: RN.Easing.linear,
  //     useNativeDriver: false,
  //   }).start();
  // }, [game.state.player.y]);

  // React.useEffect(() => {
  //   RN.Animated.timing(rot, {
  //     toValue: rotations[game.state.player.rot],
  //     duration: game.settings.speed,
  //     easing: RN.Easing.linear,
  //     useNativeDriver: false,
  //   }).start();
  // }, [game.state.player.rot]);

  const grid = (1 / game.settings.area) * 100;
  const styles = stylesheet.createThemedStyleSheet({
    head: {
      position: "absolute",
      borderRadius: 8,
      width: `${grid}%`,
      height: `${grid}%`,
      backgroundColor: "#0f0",
    },
  });

  return (
    <RN.View
      style={[
        styles.head,
        {
          left: `${grid * game.state.player.x}%`,
          top: `${grid * game.state.player.y}%`,
          // left: posX.interpolate({
          //   inputRange: [0, game.settings.area],
          //   outputRange: ["0%", `${grid * game.settings.area}%`],
          // }),
          // top: posY.interpolate({
          //   inputRange: [0, game.settings.area],
          //   outputRange: ["0%", `${grid * game.settings.area}%`],
          // }),
          transform: [
            {
              rotate: `${rotations[game.state.player.rot]}deg`,
              // rotate: rot.interpolate({
              //   inputRange: [0, 360],
              //   outputRange: ["0deg", "360deg"],
              // }),
            },
          ],
        },
      ]}
    />
  );
}
