import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { removePlugin } from "@vendetta/plugins";
import { id } from "@vendetta/plugin";

export default {
  onLoad: () =>
    showConfirmationAlert({
      title: "not finished",
      content:
        "this plugin is still in development and doesn't work yet, check back soon",
      confirmText: "Uninstall",
      confirmColor: "red" as ButtonColors,
      onConfirm: () => removePlugin(id),
    }),
};
