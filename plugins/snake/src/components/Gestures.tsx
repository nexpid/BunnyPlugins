import { React, stylesheet } from "@vendetta/metro/common";
import { EventsContext, GameContext } from "./App";
import { General } from "@vendetta/ui/components";
import { GameStatePlayerRotation } from "../stuff/types";
import { showToast } from "@vendetta/ui/toasts";

const { View } = General;

const incompatible = {
  [GameStatePlayerRotation.Right]: GameStatePlayerRotation.Left,
  [GameStatePlayerRotation.Down]: GameStatePlayerRotation.Up,
  [GameStatePlayerRotation.Left]: GameStatePlayerRotation.Right,
  [GameStatePlayerRotation.Up]: GameStatePlayerRotation.Down,
};

export default function Gestures() {
  const game = React.useContext(GameContext);
  const events = React.useContext(EventsContext);

  const threshold = 40;

  const px = React.useRef(0),
    py = React.useRef(0);

  const styles = stylesheet.createThemedStyleSheet({
    pan: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },
  });

  return (
    <View
      style={styles.pan}
      onTouchStart={(e) => {
        px.current = e.nativeEvent.pageX;
        py.current = e.nativeEvent.pageY;
      }}
      onTouchMove={(e) => {
        let hit: GameStatePlayerRotation;
        const dx = e.nativeEvent.pageX - px.current,
          dy = e.nativeEvent.pageY - py.current;

        if (dx >= threshold) hit = GameStatePlayerRotation.Right;
        else if (dx <= -threshold) hit = GameStatePlayerRotation.Left;
        else if (dy >= threshold) hit = GameStatePlayerRotation.Down;
        else if (dy <= -threshold) hit = GameStatePlayerRotation.Up;

        if (hit !== undefined) {
          px.current = e.nativeEvent.pageX;
          py.current = e.nativeEvent.pageY;
          if (
            hit !== game.state.player.rot &&
            incompatible[game.state.player.rot] !== hit
          ) {
            events.fire("rotate", hit);
            showToast(GameStatePlayerRotation[hit]);
          }
        }
      }}
    />
  );
}
