import { React, ReactNative as RN } from "@vendetta/metro/common";
import { SimpleText } from "../../../../stuff/types";
import { findByProps } from "@vendetta/metro";
import { vstorage } from "..";

const { triggerHaptic } = findByProps("triggerHaptic");

const doHaptic = async (dur: number): Promise<void> => {
  triggerHaptic();
  const interval = setInterval(triggerHaptic, 1);
  return new Promise((res) =>
    setTimeout(() => res(clearInterval(interval)), dur)
  );
};

export default function ({ until }: { until: number }) {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const started = React.useRef(Date.now());
  const oldThingy = React.useRef(0);

  React.useEffect(() => {
    if (until >= Date.now()) setTimeout(forceUpdate, 1);
  });

  const timeLeft = Math.max(until - Date.now(), 0);
  const time = Date.now() - started.current;
  const total = until - started.current;

  const done = time / total;

  let hapticTimeLeft = 0;
  if (timeLeft <= 1000) hapticTimeLeft = timeLeft % 100;
  else if (timeLeft <= 3000) hapticTimeLeft = timeLeft % 250;
  else if (timeLeft <= 5000) hapticTimeLeft = timeLeft % 500;
  else hapticTimeLeft = timeLeft % 1000;

  if (hapticTimeLeft > oldThingy.current && vstorage.haptic)
    RN.Platform.select<any>({
      android: RN.Vibration.vibrate(75),
      ios: doHaptic(75),
    });
  oldThingy.current = hapticTimeLeft;

  return (
    <SimpleText
      variant="heading-xl/semibold"
      color="TEXT_NORMAL"
      style={{
        transform: [
          { rotate: `${Math.floor((Math.random() - 0.5) * (done * 30))}deg` },
          { scale: 1 + done / 3 + Math.max((timeLeft % 1000) - 500, 0) / 1000 },
        ],
      }}
    >
      {Math.floor(timeLeft / 1000)}.
      {Math.floor((timeLeft % 1000) / 10)
        .toString()
        .padStart(2, "0")}
      s
    </SimpleText>
  );
}
