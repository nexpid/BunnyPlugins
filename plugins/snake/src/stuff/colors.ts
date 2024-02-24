import { GameSettingTheme } from "./types";

const rsg = (normal: string) => ({
  [GameSettingTheme.Normal]: normal,
});

export default {
  tiles: {
    primary: rsg("#aad751"),
    secondary: rsg("#a2d149"),
  },
  background: {
    primary: rsg("#578a34"),
    secondary: rsg("#4a752c"),
  },
};
