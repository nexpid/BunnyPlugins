import { url } from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";

import { getClient } from "./types";

const sym = Symbol.for("nexpid.vendetta.migrate");

export default function () {
  if (getClient() !== "Vendetta") return;

  if (!window[sym]) {
    window[sym] = true;

    showConfirmationAlert({
      title: "Vendetta EOL",
      content:
        "Hi, nexx here! I strongly recommend you switch over to Revenge, which is a fork of Vendetta maintained by @palmdevs. (also, this pesky popup will disappear once you do!)",
      confirmText: "Visit",
      onConfirm: () =>
        url.openURL(
          "https://github.com/Revenge-mod/Revenge#%EF%B8%8F-installing",
        ),
      cancelText: "I'll pass",
    });
  }
}
