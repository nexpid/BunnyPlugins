import { getAssetIDByName } from "@vendetta/ui/assets";
import { after, before } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { Module, ModuleCategory } from "../Module";

const remixStuff = findByProps("useIsCurrentUserEligibleForRemix");
const localFileStuff = findByProps("uploadLocalFiles");

export default new Module({
  id: "freemix",
  label: "Freemix",
  sublabel: "Unlocks the Remix feature without nitro",
  category: ModuleCategory.Unlocks,
  icon: getAssetIDByName("img_nitro_remixing"),
  extra: {
    credits: ["257109471589957632"],
  },
  runner: {
    onStart() {
      [
        "useIsCurrentUserEligibleForRemix",
        "useIsRemixEnabledForMedia",
        "useIsRemixEnabled",
      ].forEach((x) => this.patches.add(after(x, remixStuff, () => true)));
      this.patches.add(
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
    },
    onStop() {},
  },
});
