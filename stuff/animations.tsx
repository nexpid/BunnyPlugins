import { ReactNative as RN, React } from "@vendetta/metro/common";

const { Animated } = RN;

export function FadeInView({
  duration,
  children,
  style,
}: React.PropsWithChildren<{
  duration: number;
  style: any;
}>): React.JSX.Element {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  return (
    <Animated.View style={[style, { opacity: anim }]}>{children}</Animated.View>
  );
}
