export enum GameSettingFruit {
  Apple,
}
export enum GameSettingArea {
  Normal = 15,
  Small = 11,
  Big = 25,
}
export enum GameSettingTheme {
  Normal,
}
export enum GameSettingSpeed {
  Normal = 250,
  Fast = 20,
  Slow = 300,
}

export enum GameStatePlayerRotation {
  Right,
  Down,
  Left,
  Up,
}

export interface GameContextData {
  settings: {
    fruit: GameSettingFruit;
    area: GameSettingArea;
    theme: GameSettingTheme;
    speed: GameSettingSpeed;
  };
  state: {
    playing: boolean;
    player: {
      x: number;
      y: number;
      rot: GameStatePlayerRotation;
    };
    fruit: number;
  };
}
