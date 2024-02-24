import { without } from "@vendetta/utils";
import { SimpleText } from "../../../../stuff/types";
import { React } from "@vendetta/metro/common";

export default function (
  props: Parameters<typeof SimpleText>[0] & {
    duration: number;
  }
) {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const until = React.useRef(Date.now() + props.duration);

  React.useEffect(() => {
    if (until.current >= Date.now()) setTimeout(forceUpdate, 1);
  });

  const timeLeft = Math.max(until.current - Date.now(), 0);

  return (
    <SimpleText
      {...without(props, "duration")}
      style={{
        transform: [{ scale: 1 + (timeLeft / props.duration) * 0.2 }],
      }}
    />
  );
}
