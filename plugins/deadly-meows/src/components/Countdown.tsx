import { React } from "@vendetta/metro/common";
import { SimpleText } from "../../../../stuff/types";

export default function ({ until }: { until: number }) {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const started = React.useRef(Date.now());

  React.useEffect(() => {
    if (until >= Date.now()) setTimeout(forceUpdate, 1);
  });

  const timeLeft = Math.max(until - Date.now(), 0);
  const time = Date.now() - started.current;
  const total = until - started.current;

  const done = time / total;

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
