import { createMMKVBackend } from "@vendetta/storage";
import { DBSave } from "../types/api/latest";
import { plugins, startPlugin } from "@vendetta/plugins";
import { themes } from "@vendetta/themes";
import { cache, isPluginProxied, promptOrRun, vstorage } from "..";
import { installPlugin } from "@vendetta/plugins";
import { fetchTheme, installTheme } from "@vendetta/themes";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { RichText } from "../../../../stuff/types";

const BundleUpdaterManager = window.nativeModuleProxy.BundleUpdaterManager;

export async function grabEverything(): Promise<DBSave.SaveSync> {
  const sync = {
    themes: [],
    plugins: [],
  } as DBSave.SaveSync;

  for (const x of Object.values(plugins)) {
    const config = vstorage.pluginSettings[x.id];
    if (config?.syncPlugin === false) continue;

    const options =
      config?.syncStorage === false
        ? {}
        : ((await createMMKVBackend(x.id).get()) as any);
    sync.plugins.push({
      id: x.id,
      enabled: x.enabled,
      options,
    });
  }
  for (const x of Object.values(themes)) {
    sync.themes.push({
      id: x.id,
      enabled: x.selected,
    });
  }

  return sync;
}

export async function syncEverything(shouldPrompt?: boolean) {
  if (!cache.save) return;

  let syncedAnything = false;

  const newPlugins = cache.save.sync.plugins.filter(
    (x) => !Object.keys(plugins).includes(x.id) && !x.id.includes("cloud-sync")
  );
  const newUnproxiedPlugins = newPlugins.filter((x) => !isPluginProxied(x.id));

  let loadUnproxiedPlugins = true;
  if (newUnproxiedPlugins[0])
    return await promptOrRun(
      true,
      "Unproxied Plugins",
      `Do you want to install **${
        newUnproxiedPlugins.length
      }** unproxied plugin${
        newUnproxiedPlugins.length !== 1 ? "s" : ""
      }? Unproxied plugins haven't been verified by Vendetta staff and thus possibly dangerous. Are you sure you want to continue?`,
      "Proceed",
      "Skip",
      undefined,
      async () => {
        loadUnproxiedPlugins = false;
      }
    );

  const toLoadPlugins = newPlugins.filter((x) =>
    !loadUnproxiedPlugins ? isPluginProxied(x.id) : true
  );
  if (toLoadPlugins.length > 0)
    await promptOrRun(
      shouldPrompt,
      "Install Plugins",
      `Would you like to install **${toLoadPlugins.length}** newplugin${
        toLoadPlugins.length !== 1 ? "s" : ""
      }`,
      "Yes",
      "No",
      async () => {
        syncedAnything = true;
        for (const x of newPlugins) {
          createMMKVBackend(x.id).set(x.options);
          await installPlugin(x.id, false);
        }
        for (const x of newPlugins.filter((x) => x.enabled))
          await startPlugin(x.id);
        showToast("Synced plugins", getAssetIDByName("Check"));
      }
    );

  let toEnableTheme: string;
  const newThemes = cache.save.sync.themes.filter(
    (x) => !Object.keys(themes).includes(x.id)
  );
  if (newThemes.length > 0)
    await promptOrRun(
      shouldPrompt,
      "Install Themes",
      `Would you like to install **${toLoadPlugins.length}** newplugin${
        toLoadPlugins.length !== 1 ? "s" : ""
      }`,
      "Yes",
      "No",
      async () => {
        syncedAnything = true;
        for (const x of newThemes) {
          if (x.enabled) toEnableTheme = x.id;
          await installTheme(x.id);
        }
        showToast("Synced themes", getAssetIDByName("Check"));
      }
    );

  if (toEnableTheme)
    await promptOrRun(
      shouldPrompt,
      "Reload Required",
      "A reload is required to apply the theme. Would you like to reload?",
      "Reload",
      "Skip",
      async () => {
        await fetchTheme(toEnableTheme, true);
        BundleUpdaterManager.reload();
      }
    );

  if (!syncedAnything)
    showToast("Nothing to sync", getAssetIDByName("ic_sync_24px"));
}
