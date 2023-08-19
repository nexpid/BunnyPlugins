import { findByName } from "@vendetta/metro";
import { IconPackConfig } from "../../types";
import { before } from "@vendetta/patcher";

const Status = findByName("Status", false);

export default function (config: IconPackConfig) {
  const patches = new Array<() => void>();

  // fixes status being too small sometimes
  if (config.biggerStatus)
    patches.push(
      before("default", Status, (args) => {
        const c = [...args];

        const sizes = Object.values(Status.StatusSizes);
        c[0].size = sizes[sizes.findIndex((x) => c[0].size === x) + 1];
        c[0].size ??= Status.StatusSizes.XLARGE;

        return c;
      })
    );

  return () => patches.forEach((x) => x());
}
