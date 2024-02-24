import { React, ReactNative, stylesheet } from "@vendetta/metro/common";
import BackgroundTiles from "./BackgroundTiles";
import {
  GameSettingFruit,
  type GameContextData,
  GameSettingArea,
  GameStatePlayerRotation,
  GameSettingTheme,
  GameSettingSpeed,
} from "../stuff/types";
import { General } from "@vendetta/ui/components";
import Snake from "./Snake";
import { EventManager } from "../../../../stuff/Events";
import Gestures from "./Gestures";
import { SimpleText } from "../../../../stuff/types";
import { semanticColors } from "@vendetta/ui";

const { View } = General;
export const GameContext = React.createContext<GameContextData>(null);
export const EventsContext = React.createContext<EventManager>(null);

const dirs = {
  [GameStatePlayerRotation.Right]: [1, 0],
  [GameStatePlayerRotation.Down]: [0, 1],
  [GameStatePlayerRotation.Left]: [-1, 0],
  [GameStatePlayerRotation.Up]: [0, -1],
};

export default function App() {
  const [game, setGame] = React.useState<GameContextData>({
    settings: {
      fruit: GameSettingFruit.Apple,
      area: GameSettingArea.Normal,
      theme: GameSettingTheme.Normal,
      speed: GameSettingSpeed.Normal,
    },
    state: {
      playing: false,
      player: {
        x: 3,
        y: 7,
        rot: GameStatePlayerRotation.Right,
      },
      fruit: 0,
    },
  });

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0005",
    },
    base: {
      backgroundColor: "#0005",
      width: "100%",
      aspectRatio: 1,
    },
    hello: {
      position: "absolute",
      top: -40 - 15,
      width: "100%",
      height: 40,
      marginHorizontal: 50,
      borderRadius: 8,
      backgroundColor: semanticColors.BUTTON_POSITIVE_BACKGROUND,
    },
  });

  const events = new EventManager();

  const list = [
    events.listen<[GameStatePlayerRotation]>("rotate", (rot) =>
      setGame({
        ...game,
        state: {
          ...game.state,
          player: {
            ...game.state.player,
            rot,
          },
        },
      })
    ),
    events.listen("toggle play", () =>
      setGame({
        ...game,
        state: {
          ...game.state,
          playing: !game.state.playing,
        },
      })
    ),
  ];
  React.useEffect(() => () => list.forEach((x) => x.remove()));

  const trigger = () => {
    const dir = dirs[game.state.player.rot];
    const nx = game.state.player.x + dir[0],
      ny = game.state.player.y + dir[1];

    const rx = Math.min(Math.max(nx, 0), game.settings.area - 1),
      ry = Math.min(Math.max(ny, 0), game.settings.area - 1);

    setGame({
      ...game,
      state: {
        ...game.state,
        player: {
          ...game.state.player,
          x: rx,
          y: ry,
        },
      },
    });
  };

  const updater = React.useRef(trigger);
  updater.current = trigger;

  React.useEffect(() => {
    if (!game.state.playing) return;

    updater.current();
    const timeout = setInterval(() => updater.current(), game.settings.speed);
    return () => clearInterval(timeout);
  }, [game.state.playing, game.settings.speed]);

  return (
    <View style={styles.container}>
      <View style={styles.base}>
        <GameContext.Provider value={game}>
          <EventsContext.Provider value={events}>
            <BackgroundTiles />
            <Snake />
            <Gestures />
            <ReactNative.Pressable
              style={styles.hello}
              onPress={() => events.fire("toggle play")}
            >
              <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
                {game.state.playing ? "STOP PLAYING" : "START PLAYING"}
              </SimpleText>
            </ReactNative.Pressable>
          </EventsContext.Provider>
        </GameContext.Provider>
      </View>
    </View>
  );
}
