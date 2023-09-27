import { getAssetIDByName } from "@vendetta/ui/assets";
import { before, instead } from "@vendetta/patcher";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { Module, ModuleCategory } from "../stuff/Module";

const UserStore = findByStoreName("UserStore");

export default new Module({
  id: "freemix",
  label: "Freemix",
  sublabel: "Unlocks the Remix feature without nitro",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("img_nitro_remixing"),
  extra: {
    credits: ["257109471589957632"],
  },
  handlers: {
    onStart() {
      [
        "useIsRemixEnabledForMedia",
        "useIsRemixEnabled",
        "canRemix",
        "useCanRemix",
      ].forEach((x) => {
        const parent = findByProps(x);
        if (parent) this.patches.add(instead(x, parent, () => true));
      });

      this.patches.add(
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
    },
    onStop() {},
  },
});
