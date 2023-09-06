import { React } from "@vendetta/metro/common";
import { plugins } from "@vendetta/plugins";
import { emitterSymbol } from "../../stuff/util";

export default function (id: string) {
  const [status, setStatus] = React.useState(JSON.stringify(plugins[id]));
  const emitter = (plugins as any)[emitterSymbol] as Emitter;

  const handler = () => setStatus(JSON.stringify(plugins[id]));
  React.useEffect(() => {
    emitter.on("SET", handler);
    emitter.on("DEL", handler);
    return () => {
      emitter.off("SET", handler);
      emitter.off("DEL", handler);
    };
  });

  return status;
}
