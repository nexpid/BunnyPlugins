import { logger } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";

export default {
  onLoad: () => {
    FluxDispatcher.subscribe("DOWNLOAD_FILE", (...hi) =>
      logger.log("MAYBE IT WORKED??", ...hi)
    );
  },
  onUnload: () => {},
};
