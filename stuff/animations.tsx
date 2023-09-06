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
  const [isHidden, setIsHidden] = React.useState(false);

  React.useEffect(() => {
    const id = anim.addListener(({ value }) => {
      setIsHidden(value <= 0.1);
    });
    return () => anim.removeListener(id);
  }, []);

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
        setDisplay && isHidden && { display: "none" },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
