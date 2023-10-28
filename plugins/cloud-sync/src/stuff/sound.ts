const DCDSoundManager = window.nativeModuleProxy.DCDSoundManager;

interface Sound {
  play: () => void;
}

export async function makeSound(
  url: string,
  defaultDuration: number = 1
): Promise<Sound> {
  const id = Math.floor(Math.random() * 1_000_000);
  const duration = (await Promise.resolve(
    new Promise((res) =>
      DCDSoundManager.prepare(url, "notification", id, (_, meta) =>
        res(meta?.duration ?? defaultDuration)
      )
    )
  )) as number;

  let playingTimeout = null;
  return {
    play() {
      if (playingTimeout) {
        clearTimeout(playingTimeout);
        playingTimeout = null;
        DCDSoundManager.stop(id);
      }
      DCDSoundManager.play(id);
      playingTimeout = setTimeout(() => {
        playingTimeout = null;
        DCDSoundManager.stop(id);
      }, duration);
    },
  };
}
