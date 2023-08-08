import { React, ReactNative as RN } from "@vendetta/metro/common";
import Countdown from "../Countdown";
import { findByProps } from "@vendetta/metro";
import { isMeow, vstorage } from "../..";
import { General } from "@vendetta/ui/components";
import BumpyText from "../BumpyText";
import OneLastBumpyText from "../OneLastBumpyText";
import BumpyButton from "../BumpyButton";
import { punish } from "../../stuff/punisher";

const { View } = General;

const { close } = findByProps("openLazy", "close");

export default function ({ whoMew }: { whoMew: string }) {
  const dims = RN.Dimensions.get("screen");
  const bounds = [
    [dims.width * 0.1, dims.width * 0.9],
    [dims.height * 0.1, dims.height * 0.9],
  ];

  const explod = (vstorage.explodeTime ?? 5) * 1000;

  const [finished, setFinished] = React.useState(false);
  const [survived, setSurvived] = React.useState(false);
  const countdownUntil = React.useRef(Date.now() + explod);
  const buttonPos = React.useRef([
    Math.random() * (bounds[0][1] - bounds[0][0]) + bounds[0][0],
    Math.random() * (bounds[1][1] - bounds[1][0]) + bounds[1][0],
  ]);

  isMeow.active = true;
  const closeThing = () => {
    isMeow.active = false;
    isMeow.cooldown = Date.now() + 10_000;
    close();
  };

  React.useEffect(() => {
    setTimeout(() => setFinished(true), explod);
    if (finished) {
      if (survived) setTimeout(closeThing, 1000);
      else
        setTimeout(() => {
          closeThing();
          punish();
        }, 1000);
    }
  }, [finished]);

  return (
    <View
      duration={500}
      fade="in"
      style={{
        backgroundColor: "#0005",
        width: dims.width,
        height: dims.height,
      }}
      animateOnInit={true}
    >
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {finished ? (
          <OneLastBumpyText
            variant="heading-xxl/bold"
            color="TEXT_NORMAL"
            duration={350}
          >
            {survived ? "Good job!" : "Better luck next time!"}
          </OneLastBumpyText>
        ) : (
          <>
            <BumpyText
              variant="heading-xxl/bold"
              color="TEXT_NORMAL"
              style={{ marginBottom: 12 }}
              until={countdownUntil.current}
              align="center"
            >
              Quick, {whoMew} meowed!
            </BumpyText>
            <Countdown until={countdownUntil.current} />
          </>
        )}
      </View>
      {!finished && (
        <BumpyButton
          text="Tap Me!"
          color="green"
          size="small"
          onPress={() => {
            setSurvived(true);
            setFinished(true);
          }}
          style={[
            {
              position: "absolute",
              zIndex: 2,
              left: buttonPos.current[0],
              top: buttonPos.current[1],
              width: 90,
            },
          ]}
          until={countdownUntil.current}
        />
      )}
    </View>
  );
}
