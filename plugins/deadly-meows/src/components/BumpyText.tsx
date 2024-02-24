import { without } from "@vendetta/utils";
import { SimpleText } from "../../../../stuff/types";
import { React } from "@vendetta/metro/common";

export default function (
  props: Parameters<typeof SimpleText>[0] & {
    until: number;
  }
) {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);

  React.useEffect(() => {
    if (props.until >= Date.now()) setTimeout(forceUpdate, 1);
  });

  const timeLeft = Math.max(props.until - Date.now(), 0);

  return (
    <SimpleText
      {...without(props, "until")}
      style={{
        transform: [
          { scale: 1 + Math.max(((timeLeft * 2) % 1000) - 500, 0) / 5_000 },
        ],
      }}
    />
  );
}
