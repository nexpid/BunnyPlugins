import { findByName } from "@vendetta/metro";
import { IconPackConfig } from "../../types";
import { before } from "@vendetta/patcher";

const Status = findByName("Status", false);

export default function (config: IconPackConfig) {
  const patches = new Array<() => void>();

  if (config.biggerStatus)
    patches.push(
      before("default", Status, ([x]) => {
        x.size *= 1.4;
      })
    );

  return () => patches.forEach((x) => x());
}
