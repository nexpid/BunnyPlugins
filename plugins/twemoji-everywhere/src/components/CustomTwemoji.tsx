import { ReactNative as RN } from "@vendetta/metro/common";
import { getSrc } from "../stuff/twemoji";

export default function ({ src, size = 16 }: { src: string; size?: number }) {
  return (
    <RN.Image
      key={`emoji-${src}`}
      source={{
        uri: getSrc(src),
      }}
      resizeMode="contain"
      fadeDuration={0}
      style={{
        height: size,
        width: size,
      }}
      //@ts-ignore custom property
      vanilla={true}
    />
  );
}
