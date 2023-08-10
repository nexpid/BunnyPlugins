import { plugins } from "@vendetta/plugins";
import { useProxy } from "@vendetta/storage";

export default function ({
  id,
  set,
}: {
  id: string;
  set: (val: boolean) => void;
}) {
  useProxy(plugins);
  set(plugins[id] !== undefined);

  return null;
}
