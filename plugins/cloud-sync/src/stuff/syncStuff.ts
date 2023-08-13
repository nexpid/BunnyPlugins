import { createFileBackend, createMMKVBackend } from "@vendetta/storage";
import { DBSave } from "../types/api/latest";
import { plugins } from "@vendetta/plugins";
import { themes } from "@vendetta/themes";
import { cache, canImport, isPluginProxied, vstorage } from "..";
import { installPlugin } from "@vendetta/plugins";
import { installTheme } from "@vendetta/themes";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showConfirmationAlert } from "@vendetta/ui/alerts";

const { BundleUpdaterManager, MMKVManager } = window.nativeModuleProxy;

export async function grabEverything(): Promise<DBSave.SaveSync> {
  const sync = {
    themes: [],
    plugins: [],
  } as DBSave.SaveSync;

  for (const x of Object.values(plugins)) {
    const config = vstorage.pluginSettings?.[x.id];
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

let importCallback: (x: boolean) => void;
export function setImportCallback(fnc: typeof importCallback) {
  importCallback = fnc;
}

export type SyncImportOptions = Record<
  "unproxiedPlugins" | "plugins" | "themes",
  boolean
>;
export async function importData(options: SyncImportOptions) {
  if (!cache.save) return;
  importCallback?.(true);

  const iplugins = [
    ...cache.save.sync.plugins.filter(
      (x) =>
        !plugins[x.id] &&
        !isPluginProxied(x.id) &&
        canImport(x.id) &&
        options.unproxiedPlugins
    ),
    ...cache.save.sync.plugins.filter(
      (x) =>
        !plugins[x.id] &&
        isPluginProxied(x.id) &&
        canImport(x.id) &&
        options.plugins
    ),
  ];
  const ithemes = cache.save.sync.themes.filter(
    (x) => !themes[x.id] && options.themes
  );

  if (!iplugins[0] && !ithemes[0]) {
    importCallback?.(false);
    return showToast("Nothing to import", getAssetIDByName("Small"));
  }

  showToast(
    `Importing ${[
      iplugins.length &&
        `${iplugins.length} plugin${iplugins.length !== 1 ? "s" : ""}`,
      ithemes.length &&
        `${ithemes.length} theme${ithemes.length !== 1 ? "s" : ""}`,
    ]
      .filter((x) => !!x)
      .join(" and ")}`,
    getAssetIDByName("toast_image_saved")
  );

  const status = { plugins: 0, themes: 0 };
  await Promise.all([
    ...iplugins.map(
      (x) =>
        new Promise<void>(async (res) => {
          MMKVManager.setItem(x.id, JSON.stringify(x.options));
          installPlugin(x.id, x.enabled)
            .then(() => status.plugins++)
            .finally(res);
        })
    ),
    ...ithemes.map(
      (x) =>
        new Promise<void>(async (res) =>
          installTheme(x.id)
            .then(() => status.themes++)
            .finally(res)
        )
    ),
  ]);

  showToast(
    `Imported ${[
      [status.plugins, "plugin"],
      [status.themes, "theme"],
    ]
      .map(([count, label]) => `${count} ${label}${count !== 1 ? "s" : ""}`)
      .join(" and ")}!`,
    getAssetIDByName("check")
  );

  const selectTheme = themes[ithemes.find((x) => x.enabled)?.id];
  if (selectTheme) {
    await createFileBackend("vendetta_theme.json").set(
      Object.assign(selectTheme, {
        selected: true,
      })
    );
    await (() =>
      new Promise<void>((res) =>
        showConfirmationAlert({
          title: "Theme selected",
          content:
            "A reload is required to see the theme. Do you want to reload now?",
          confirmText: "Reload",
          confirmColor: "red" as ButtonColors,
          onConfirm: () => {
            window.nativeModuleProxy.BundleUpdaterManager.reload();
            res();
          },
          cancelText: "Skip",
          //@ts-ignore not in typings
          onCancel: res,
          isDismissable: true,
        })
      ))();
  }

  importCallback?.(false);
}

// export async function syncEverything(shouldPrompt?: boolean) {
//   if (!cache.save) return;

//   let syncedAnything = false;

//   const newPlugins = cache.save.sync.plugins.filter(
//     (x) => !Object.keys(plugins).includes(x.id) && !x.id.includes("cloud-sync")
//   );
//   const newUnproxiedPlugins = newPlugins.filter((x) => !isPluginProxied(x.id));

//   let loadUnproxiedPlugins = true;
//   if (newUnproxiedPlugins[0])
//     await promptOrRun(
//       true,
//       "Unproxied Plugins",
//       `Do you want to install **${
//         newUnproxiedPlugins.length
//       }** unproxied plugin${
//         newUnproxiedPlugins.length !== 1 ? "s" : ""
//       }? Unproxied plugins haven't been verified by Vendetta staff and thus possibly dangerous. Are you sure you want to continue?`,
//       "Proceed",
//       "Skip",
//       undefined,
//       async () => {
//         loadUnproxiedPlugins = false;
//       }
//     );

//   const toLoadPlugins = newPlugins.filter((x) =>
//     !loadUnproxiedPlugins ? isPluginProxied(x.id) : true
//   );
//   if (toLoadPlugins.length > 0)
//     await promptOrRun(
//       shouldPrompt,
//       "Install Plugins",
//       `Would you like to install **${toLoadPlugins.length}** new plugin${
//         toLoadPlugins.length !== 1 ? "s" : ""
//       }?`,
//       "Yes",
//       "No",
//       async () => {
//         syncedAnything = true;
//         for (const x of newPlugins) {
//           createMMKVBackend(x.id).set(x.options);
//           await installPlugin(x.id, x.enabled);
//         }
//         showToast("Synced plugins", getAssetIDByName("Check"));
//       }
//     );

//   let toEnableTheme: string;
//   const newThemes = cache.save.sync.themes.filter(
//     (x) => !Object.keys(themes).includes(x.id)
//   );
//   if (newThemes.length > 0)
//     await promptOrRun(
//       shouldPrompt,
//       "Install Themes",
//       `Would you like to install **${newThemes.length}** new theme${
//         newThemes.length !== 1 ? "s" : ""
//       }?`,
//       "Yes",
//       "No",
//       async () => {
//         syncedAnything = true;
//         for (const x of newThemes) {
//           if (x.enabled) toEnableTheme = x.id;
//           await installTheme(x.id);
//         }
//         showToast("Synced themes", getAssetIDByName("Check"));
//       }
//     );

//   if (toEnableTheme)
//     await promptOrRun(
//       shouldPrompt,
//       "Reload Required",
//       "A reload is required to apply the theme. Would you like to reload?",
//       "Reload",
//       "Skip",
//       async () => {
//         await fetchTheme(toEnableTheme, true);
//         BundleUpdaterManager.reload();
//       }
//     );

//   if (!syncedAnything)
//     showToast("Nothing to sync", getAssetIDByName("ic_sync_24px"));
// }
