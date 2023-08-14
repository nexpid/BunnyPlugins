import { ReactNative as RN } from "@vendetta/metro/common";

export default function ({ src, size }: { src: string; size: number }) {
  return (
    <RN.Image
      key={`emoji-${src}`}
      source={{
        uri: `https://twemoji.maxcdn.com/v/14.0.2/72x72/${src}.png`,
      }}
      style={{
        height: size,
        width: size,
      }}
    />
  );
}
