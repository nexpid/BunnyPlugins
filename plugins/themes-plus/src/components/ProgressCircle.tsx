import { React } from "@vendetta/metro/common";

import { Reanimated, Svg } from "$/deps";

const AnimatedCircle = Reanimated.default.createAnimatedComponent(Svg.Circle);

export default function ProgressCircle({
  radius,
  stroke,
  color,
  progress,
}: {
  radius: number;
  stroke: number;
  color: string;
  progress: number;
}) {
  const { viewbox, circleRadius, circumference } = React.useMemo(
    () => ({
      viewbox: (radius + stroke) * 2,
      circleRadius: radius,
      circumference: 2 * Math.PI * (radius + stroke / 2),
    }),
    [radius, stroke],
  );

  const animatedProgress = Reanimated.useSharedValue(circumference);
  const animatedStroke = Reanimated.useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = Reanimated.withTiming(
      circumference - progress * circumference,
      {
        duration: 250,
      },
    );
    animatedStroke.value = Reanimated.withTiming(progress !== 0 ? stroke : 0, {
      duration: 250,
    });
  }, [progress, circumference, stroke]);

  return (
    <Svg.Svg
      width={viewbox}
      height={viewbox}
      viewBox={`0 0 ${viewbox} ${viewbox}`}
      style={{
        position: "absolute",
        transform: [{ rotate: "-90deg" }, { translateY: stroke }],
      }}
      pointerEvents="none"
    >
      <AnimatedCircle
        cx="50%"
        cy="50%"
        stroke={color}
        strokeWidth={animatedStroke}
        r={circleRadius}
        fill={"#0000"}
        strokeDasharray={circumference}
        strokeLinecap="round"
        strokeDashoffset={animatedProgress}
      />
    </Svg.Svg>
  );
}
