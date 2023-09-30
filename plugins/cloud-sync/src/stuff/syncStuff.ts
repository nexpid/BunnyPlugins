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
import {
  isInPage,
  clearLogs,
  addLog,
} from "../components/pages/ImportLogsPage";

const { MMKVManager } = window.nativeModuleProxy;

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
export async function importData(
  save: DBSave.Save,
  options: SyncImportOptions
) {
  if (!save) return;
  importCallback?.(true);

  const iplugins = [
    ...save.sync.plugins.filter(
      (x) =>
        !plugins[x.id] &&
        !isPluginProxied(x.id) &&
        canImport(x.id) &&
        options.unproxiedPlugins
    ),
    ...save.sync.plugins.filter(
      (x) =>
        !plugins[x.id] &&
        isPluginProxied(x.id) &&
        canImport(x.id) &&
        options.plugins
    ),
  ];
  const ithemes = save.sync.themes.filter(
    (x) => !themes[x.id] && options.themes
  );

  if (!iplugins[0] && !ithemes[0]) {
    importCallback?.(false);
    return showToast("Nothing to import", getAssetIDByName("Small"));
  }

  clearLogs();
  addLog(
    "importer",
    `Starting to import ${iplugins.length} plugin${
      iplugins.length !== 1 ? "s" : ""
    } and ${ithemes.length} theme${ithemes.length !== 1 ? "s" : ""}`
  );

  if (!isInPage)
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

  const status = { plugins: 0, themes: 0, failed: 0 };
  await Promise.all([
    ...iplugins.map(
      (x) =>
        new Promise<void>(async (res) => {
          MMKVManager.setItem(x.id, JSON.stringify(x.options));
          installPlugin(x.id, x.enabled)
            .then(() => {
              status.plugins++;
              addLog("plugins", `Successfully imported plugin: ${x.id}`);
            })
            .catch((e) => {
              status.failed++;
              addLog("plugins", `Failed to import plugin: ${x.id}\n${e}`);
            })
            .finally(res);
        })
    ),
    ...ithemes.map(
      (x) =>
        new Promise<void>(async (res) =>
          installTheme(x.id)
            .then(() => {
              status.themes++;
              addLog("themes", `Successfully imported theme: ${x.id}`);
            })
            .catch((e) => {
              status.failed++;
              addLog("themes", `Failed to import theme: ${x.id}\n${e}`);
            })
            .finally(res)
        )
    ),
  ]);

  if (!isInPage)
    showToast(
      `Imported ${[
        [status.plugins, "plugin"],
        [status.themes, "theme"],
      ]
        .map(([count, label]) => `${count} ${label}${count !== 1 ? "s" : ""}`)
        .join(" and ")}! (${status.failed} failed)`,
      getAssetIDByName("check")
    );

  const selectTheme = themes[ithemes.find((x) => x.enabled)?.id];
  if (selectTheme) {
    addLog("themes", `Selecting theme: ${selectTheme.id}`);
    await createFileBackend("vendetta_theme.json").set(
      Object.assign(selectTheme, {
        selected: true,
      })
    );
    addLog("themes", "Prompting user to reload");
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

  addLog(
    "importer",
    `Finished! Imported ${status.plugins} plugin${
      status.plugins !== 1 ? "s" : ""
    } and ${status.themes} theme${status.themes !== 1 ? "s" : ""}. ${
      status.failed
        ? `Failed to import ${status.failed} plugin${
            status.failed !== 1 ? "s" : ""
          }/theme${status.failed !== 1 ? "s" : ""}`
        : "All imports were successful"
    }`
  );
  importCallback?.(false);
}
