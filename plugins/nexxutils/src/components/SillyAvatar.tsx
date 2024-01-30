import { findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";

import { getUserAvatar } from "$/types";

const { Pressable } = General;

const UserStore = findByStoreName("UserStore");

export default function () {
  const [rot, setRot] = React.useState(0);
  const [urImage, setUrImage] = React.useState(false);
  const anim = React.useRef(new RN.Animated.Value(0)).current;

  React.useEffect(() => {
    RN.Animated.timing(anim, {
      toValue: rot * (Math.PI / 180),
      duration: 4000,
      easing: RN.Easing.out(RN.Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [rot]);

  return (
    <Pressable
      onPress={() => setRot(rot + 360 * 5)}
      style={{ marginRight: 12 }}
      onLongPress={() => {
        setUrImage(!urImage);
        RN.LayoutAnimation.configureNext({ duration: 700 });
      }}
    >
      <RN.Animated.Image
        style={{
          height: 85,
          width: 85,
          borderRadius: 18,
          transform: [{ rotate: anim }],
        }}
        source={{
          uri: urImage
            ? getUserAvatar(UserStore.getCurrentUser(), true)
            : "https://cdn.discordapp.com/attachments/919655852724604978/1131722678450004118/fish.gif",
        }}
      />
    </Pressable>
  );
}
