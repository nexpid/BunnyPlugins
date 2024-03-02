import { url } from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";

import RNFS from "$/wrappers/RNFS";

import { getClient } from "./types";

// Symbol used so this notice appears only once even when included in multiple plugins
const sym = Symbol.for("nexpid.vendetta.migrate");
const filePath = `${RNFS.DocumentDirectoryPath}/vendetta/NexpidMigrate`;

export default async function () {
  if (getClient() !== "Vendetta") return;
  const migrationDismissed = await RNFS.exists(filePath);

  if (!migrationDismissed && !window[sym]) {
    window[sym] = true;

    showConfirmationAlert({
      title: "Vendetta EOL",
      content:
        "Hi there, nexx here! Vendetta was recently discontinued, meaning it could break at any time. I personally recommend that you switch to Revenge - a fork of Vendetta maintained by @palmdevs.",
      confirmText: "Visit Revenge",
      onConfirm: () =>
        url.openURL(
          "https://github.com/Revenge-mod/Revenge#%EF%B8%8F-installing",
        ),
      onCancel: async () =>
        await RNFS.writeFile(filePath, "dismissed (maisy was here :3)"),
      cancelText: "I'll pass (hide this popup forever)",
    });
  }
}
