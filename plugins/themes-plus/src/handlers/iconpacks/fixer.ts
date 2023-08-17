import { findByName } from "@vendetta/metro";
import { IconPackConfig } from "../../types";
import { before } from "@vendetta/patcher";

const Status = findByName("Status", false);

export default function (config: IconPackConfig) {
  const patches = new Array<() => void>();

  // fixes status being too small sometimes
  if (config.biggerStatus)
    patches.push(
      before("default", Status, ([x]) => {
        const y = { ...x };
        y.size *= 1.4;
        return [y];
      })
    );

  return () => patches.forEach((x) => x());
}
