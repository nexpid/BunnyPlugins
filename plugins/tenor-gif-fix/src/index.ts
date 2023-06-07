import { logger } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";

export default {
  onLoad: () => {
    FluxDispatcher.subscribe("DOWNLOAD_FILE", (...hi) =>
      logger.log("MAYBE IT WORKED??", ...hi)
    );
    logger.log("super awesome plugin enabled");
  },
  onUnload: () => {
    logger.log("super awesome plugin disabled");
  },
};
