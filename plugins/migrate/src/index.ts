import { NavigationNative } from "@vendetta/metro/common";
import { plugins } from "@vendetta/plugins";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { showToast } from "@vendetta/ui/toasts";

const shallDo = [
  "https://vendetta.nexpid.xyz/",
  "https://vd-plugins.github.io/proxy/vendetta.nexpid.xyz/",
];

const migratePlugin = (plugin: any) => {
  const whichShallDo = shallDo.find((x) =>
    plugin.id.toLowerCase().startsWith(x.toLowerCase()),
  );
  if (!whichShallDo) return 0;

  const newId = `https://bunny.nexpid.xyz/${plugin.id.slice(whichShallDo.length)}`;

  delete plugins[plugin.id];
  plugin.id = newId;
  plugin.update = true;
  plugins[newId] = plugin;

  return 1;
};

export const settings = () => {
  const navigation = NavigationNative.useNavigation();
  navigation.goBack();

  showConfirmationAlert({
    title: "Migrate Plugins",
    content:
      "This will migrate all of nexpid's plugins to their latest (unproxied) versions. Are you sure you want to do this?",
    confirmText: "Confirm",
    onConfirm: () => {
      let didMigrate = 0;
      for (const plugin of Object.keys(plugins))
        didMigrate += migratePlugin(plugins[plugin]);

      if (didMigrate > 0)
        showToast(
          `Migrated ${didMigrate} plugin(s). Restart your client to apply changes.`,
        );
      else showToast("No plugins were migrated.");
    },
  });
};
