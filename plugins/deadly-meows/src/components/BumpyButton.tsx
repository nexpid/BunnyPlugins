import { without } from "@vendetta/utils";
import { React } from "@vendetta/metro/common";
import { Button } from "@vendetta/ui/components";

export default function (props: {
  until: number;
  style: any[];
  [k: string]: any;
}) {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);

  React.useEffect(() => {
    if (props.until >= Date.now()) setTimeout(forceUpdate, 1);
  });

  const timeLeft = Math.max(props.until - Date.now(), 0);

  return (
    <Button
      {...without(props, "until")}
      style={[
        ...props.style,
        {
          transform: [
            { scale: 1 + Math.max(((timeLeft * 2) % 1000) - 500, 0) / 8_000 },
          ],
        },
      ]}
    />
  );
}
