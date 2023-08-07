import { plugin } from "@vendetta";
import { removePlugin } from "@vendetta/plugins";
import { showToast } from "@vendetta/ui/toasts";

removePlugin(plugin.id);
showToast("Meow");
