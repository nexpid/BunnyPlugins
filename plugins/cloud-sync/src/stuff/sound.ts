import { RNSoundManager } from "$/deps";
interface Sound {
  play: () => void;
}

export async function makeSound(
  url: string,
  defaultDuration: number = 1,
): Promise<Sound> {
  const id = Math.floor(Math.random() * 1_000_000);
  const duration = (await Promise.resolve(
    new Promise((res) =>
      RNSoundManager.prepare(url, "notification", id, (_, meta) =>
        res(meta?.duration ?? defaultDuration),
      ),
    ),
  )) as number;

  let playingTimeout = null;
  return {
    play() {
      if (playingTimeout) {
        clearTimeout(playingTimeout);
        playingTimeout = null;
        RNSoundManager.stop(id);
      }
      RNSoundManager.play(id);
      playingTimeout = setTimeout(() => {
        playingTimeout = null;
        RNSoundManager.stop(id);
      }, duration);
    },
  };
}
