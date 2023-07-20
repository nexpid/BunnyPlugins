import { getAssetIDByName } from "@vendetta/ui/assets";
import { Module, ModuleCategory } from "../Module";
import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

const MediaManager = findByProps("downloadMediaAsset");
const ActionSheet = findByProps("openLazy", "hideActionSheet");

const parseURL = (url: string): string | undefined => {
  const path = url.split("/");
  const tenorIndex = path.findIndex((x) => x.endsWith(".tenor.com"));
  if (tenorIndex === -1) return;

  const [host, id, file] = path.slice(tenorIndex, tenorIndex + 3);
  if (!host || !id || !file) return;

  return `https://${host}/${id.slice(0, -2)}AC/${file.split(".")[0]}.gif`;
};

export default new Module({
  id: "tenor-gif-fix",
  label: "Tenor GIF Fix",
  sublabel: "Downloads Tenor links as GIFs instead of videos",
  category: ModuleCategory.Fixes,
  icon: getAssetIDByName("ic_gif_24px"),
  runner: {
    onStart() {
      this.patches.add(
        before("downloadMediaAsset", MediaManager, (args) => {
          const url = args[0];
          if (!url || typeof url !== "string") return;

          const parsed = parseURL(url);
          if (parsed) {
            args[0] = parsed;
            args[1] = 1;
          }
        })
      );

      this.patches.add(
        before("openLazy", ActionSheet, (ctx) => {
          const [_, action, args] = ctx;

          if (action !== "MediaShareActionSheet") return;

          const data = args?.syncer?.sources?.[0];
          if (!data || typeof data.uri !== "string") return;

          const parsed = parseURL(data.uri);
          if (parsed) {
            data.uri = parsed;
            data.sourceURI = parsed;
            delete data.videoURI;
            delete data.isGIFV;
          }

          args.syncer.sources[0] = data;
        })
      );
    },
    onStop() {},
  },
});
