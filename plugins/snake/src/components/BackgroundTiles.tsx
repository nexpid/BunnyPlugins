import { React, stylesheet } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import { GameContext } from "./App";
import colors from "../stuff/colors";

const { View } = General;

export default function BackgroundTiles() {
  const game = React.useContext(GameContext);

  const styles = stylesheet.createThemedStyleSheet({
    row: {
      width: "100%",
      flexDirection: "row",
    },
    pixel: {
      backgroundColor: colors.tiles.primary[game.settings.theme],
      height: "100%",
      aspectRatio: 1 / 1,
    },
    pixelAlt: {
      backgroundColor: colors.tiles.secondary[game.settings.theme],
    },
  });

  const gridArray = new Array(game.settings.area).fill(0);
  return (
    <>
      {gridArray.map((_, i, a) => (
        <View style={[styles.row, { height: `${(1 / a.length) * 100}%` }]}>
          {gridArray.map((_, j) => (
            <View
              style={[styles.pixel, (i + j) % 2 === 0 && styles.pixelAlt]}
            />
          ))}
        </View>
      ))}
    </>
  );
}
