import { ReactNative as RN, React } from "@vendetta/metro/common";

const { Animated } = RN;

export function FadeView({
  duration,
  children,
  style,
  fade,
  trigger,
  customOpacity,
  setDisplay,
  animateOnInit,
}: React.PropsWithChildren<{
  duration: number;
  style?: any;
  fade: "in" | "out";
  trigger?: any;
  customOpacity?: number;
  setDisplay?: boolean;
  animateOnInit?: boolean;
}>) {
  animateOnInit ??= true;

  const firstInit = React.useRef(true),
    firstUpdate = React.useRef(true);
  const anim = React.useRef(
    new Animated.Value(animateOnInit ? (fade === "in" ? 1 : 0) : 0)
  ).current;

  React.useEffect(() => {
    if (!animateOnInit && firstInit.current) {
      firstInit.current = false;
      return;
    }
    if (!animateOnInit && firstUpdate.current) {
      anim.setValue(fade === "in" ? 0 : 1);
      firstUpdate.current = false;
    }

    Animated.timing(anim, {
      toValue: customOpacity ?? (fade === "in" ? 1 : 0),
      duration,
      useNativeDriver: true,
    }).start();
  }, [anim, fade, customOpacity, trigger]);

  return (
    <Animated.View
      style={[
        { opacity: anim },
        setDisplay &&
          //@ts-ignore
          anim._value === 0 && {
            display: "none",
          },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
