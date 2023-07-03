import { ReactNative as RN, React } from "@vendetta/metro/common";

const { Animated } = RN;

export function FadeView({
  duration,
  children,
  style,
  fade,
}: React.PropsWithChildren<{
  duration: number;
  style: any;
  fade: "in" | "out";
}>): React.JSX.Element {
  const anim = React.useRef(new Animated.Value(fade === "in" ? 0 : 1)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: fade === "in" ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [anim, fade]);

  return (
    <Animated.View style={[style, { opacity: anim }]}>{children}</Animated.View>
  );
}
