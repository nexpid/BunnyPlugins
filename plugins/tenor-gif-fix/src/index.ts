import { patcher } from "@vendetta";
import { findByProps } from "@vendetta/metro";

const MediaManager = findByProps("downloadMediaAsset"); // thank you rosie

const unpatch = patcher.before("downloadMediaAsset", MediaManager, (args) => {
  const uri = args[0];
  if (!uri || typeof uri !== "string") return;

  const path = uri.split("/");
  const tenorIndex = path.findIndex((x) => x.endsWith(".tenor.com"));
  if (tenorIndex === -1) return;

  const [host, id, file] = path.slice(tenorIndex, tenorIndex + 3);
  if (!host || !id || !file) return;

  args[0] = `https://${host}/${id.slice(0, -2)}AC/${file.split(".")[0]}.gif`;
  args[1] = 1;
});

export default {
  onUnload: () => unpatch,
};
