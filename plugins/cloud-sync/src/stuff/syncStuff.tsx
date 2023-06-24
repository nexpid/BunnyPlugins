import { createMMKVBackend } from "@vendetta/storage";
import { DBSave } from "../types/api/latest";
import { plugins, themes } from "@vendetta";
import { cache, promptOrRun, vstorage } from "..";
import { installPlugin } from "@vendetta/plugins";
import { fetchTheme, installTheme } from "@vendetta/themes";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { RichText } from "../../../../types";

const BundleUpdaterManager = window.nativeModuleProxy.BundleUpdaterManager;

export async function grabEverything(): Promise<DBSave.SaveSync> {
  const sync = {
    themes: [],
    plugins: [],
  } as DBSave.SaveSync;

  for (const x of Object.values(plugins.plugins)) {
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
  for (const x of Object.values(themes.themes)) {
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
    (x) => !Object.keys(plugins.plugins).includes(x.id)
  );
  if (newPlugins.length > 0)
    await promptOrRun(
      shouldPrompt,
      "Install Plugins",
      [
        "Would you like to install ",
        <RichText.Bold>{newPlugins.length.toString()}</RichText.Bold>,
        ` new plugin${newPlugins.length !== 1 ? "s" : ""}?`,
      ],
      async () => {
        syncedAnything = true;
        for (const x of newPlugins) {
          createMMKVBackend(x.id).set(x.options);
          await installPlugin(x.id, x.enabled);
        }
        showToast("Synced plugins", getAssetIDByName("Check"));
      }
    );

  let toEnableTheme;
  const newThemes = cache.save.sync.themes.filter(
    (x) => !Object.keys(themes.themes).includes(x.id)
  );
  if (newThemes.length > 0)
    await promptOrRun(
      shouldPrompt,
      "Install Themes",
      [
        "Would you like to install ",
        <RichText.Bold>{newThemes.length.toString()}</RichText.Bold>,
        ` new theme${newThemes.length !== 1 ? "s" : ""}?`,
      ],
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
      async () => {
        await fetchTheme(toEnableTheme, true);
        BundleUpdaterManager.reload();
      }
    );

  if (!syncedAnything)
    showToast("Already synced", getAssetIDByName("ic_sync_24px"));
}
