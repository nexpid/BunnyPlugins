import { findByProps } from "@vendetta/metro";
import { after, before } from "@vendetta/patcher";

const remixStuff = findByProps("useIsCurrentUserEligibleForRemix");
const localFileStuff = findByProps("uploadLocalFiles");

export default function () {
  const patches = [];

  [
    "useIsCurrentUserEligibleForRemix",
    "useIsRemixEnabledForMedia",
    "useIsRemixEnabled",
  ].forEach((x) => patches.push(after(x, remixStuff, () => true)));

  patches.push(
    before("uploadLocalFiles", localFileStuff, (args) =>
      args.map((x) => {
        x.items = x.items.map((y) => {
          y.isRemix = false;
          y.item.isRemix = false;
          return y;
        });
        return x;
      })
    )
  );

  return () => patches.forEach((x) => x?.());
}
