import { findByProps, findByStoreName } from "@vendetta/metro";
import { after, before } from "@vendetta/patcher";

const UserStore = findByStoreName("UserStore");

export default function () {
  const patches = [];

  [
    "useIsRemixEnabledForMedia",
    "useIsRemixEnabled",
    "canRemix",
    "useCanRemix",
  ].forEach((x) => {
    const parent = findByProps(x);
    if (parent) patches.push(after(x, parent, () => true));
  });

  patches.push(
    before(
      "uploadLocalFiles",
      findByProps("uploadLocalFiles"),
      (args) =>
        !UserStore.getCurrentUser()?.premiumType &&
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
