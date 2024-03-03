import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";

import { Reanimated } from "$/deps";

import kazuma from "../../assets/kazuma.png";
import { vstorage } from "..";

export const kyrDt = {
  w: 220,
  h: 146,
  col: 5,
  row: 4,
};

const rem = (rad: number) => rad * 16;
const width = rem(15);
const height = Math.floor(rem((kyrDt.h / kyrDt.w) * 15));

export let frameSet: (frame: number) => void;
export let openSet: (open: boolean) => void;
export let scaleSet: () => void;

export const kyriuStyles = stylesheet.createThemedStyleSheet({
  base: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  frame: {
    width,
    height,
    zIndex: 100,
    overflow: "hidden",
  },
  empty: {
    position: "absolute",
    left: 0,
    top: 0,
    width: width * kyrDt.col,
    height: height * kyrDt.row,
  },
});

export default function Kiryu({ oldUI }: { oldUI: boolean }) {
  const [frame, setFrame] = React.useState(0);
  frameSet = setFrame;
  const [open, setOpen] = React.useState(false);
  openSet = setOpen;

  const off = oldUI ? rem(2.5) : rem(6);

  const posVal = Reanimated.useSharedValue(
    vstorage.appearStyle === "fly" ? -height - 15 : off,
  );
  const opVal = Reanimated.useSharedValue(
    vstorage.appearStyle === "fly" ? 1 : 0,
  );
  const rotVal = Reanimated.useSharedValue(
    vstorage.swinging ? "-5deg" : "0deg",
  );
  const scaleVal = Reanimated.useSharedValue(1);

  React.useEffect(() => {
    if (vstorage.appearStyle === "fly") {
      opVal.value = 1;
      posVal.value = Reanimated.withTiming(open ? off : -height - 15, {
        duration: 600,
        easing: open
          ? Reanimated.Easing.out(Reanimated.Easing.back(1.5))
          : Reanimated.Easing.in(Reanimated.Easing.cubic),
      });
    } else {
      posVal.value = off;
      opVal.value = Reanimated.withTiming(open ? 1 : 0, {
        duration: 222,
      });
    }
  }, [open, vstorage.appearStyle]);

  React.useEffect(() => {
    if (vstorage.swinging)
      rotVal.value = Reanimated.withRepeat(
        Reanimated.withTiming("5deg", {
          duration: 900,
        }),
        -1,
        true,
      );
    else rotVal.value = "0deg";
  }, [vstorage.swinging]);

  scaleSet = () => {
    if (!vstorage.bounce) return;
    scaleVal.value = 1.05;
    scaleVal.value = Reanimated.withTiming(1, {
      duration: 90,
    });
  };

  return (
    <RN.View style={kyriuStyles.base} pointerEvents="none">
      <Reanimated.default.View
        style={[
          kyriuStyles.frame,
          {
            marginTop: posVal,
            opacity: opVal,
            transform: [{ rotate: rotVal }, { scale: scaleVal }],
          },
        ]}
      >
        <RN.Image
          source={{ uri: kazuma }}
          style={{
            position: "absolute",
            left: -(frame % kyrDt.col) * width,
            top: -Math.floor(frame / kyrDt.col) * height,
            width: width * kyrDt.col,
            height: height * kyrDt.row,
          }}
          resizeMode="stretch"
        />
      </Reanimated.default.View>
    </RN.View>
  );
}
