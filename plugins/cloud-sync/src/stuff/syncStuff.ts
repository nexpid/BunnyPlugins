import { plugins } from "@vendetta/plugins";
import { installPlugin } from "@vendetta/plugins";
import { createFileBackend, createMMKVBackend } from "@vendetta/storage";
import { themes } from "@vendetta/themes";
import { installTheme } from "@vendetta/themes";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { RNBundleUpdaterManager, RNMMKVManager } from "$/deps";

import { canImport, isPluginProxied, lang, vstorage } from "..";
import {
  addLog,
  clearLogs,
  isInPage,
} from "../components/pages/ImportLogsPage";
import { DBSave } from "../types/api/latest";

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

let importCallback: (x: boolean) => void;
export function setImportCallback(fnc: typeof importCallback) {
  importCallback = fnc;
}

const plural = (len: number) =>
  len !== 1
    ? lang.format("combo.plugins.plural", { count: len })
    : lang.format("combo.plugins", {});

export type SyncImportOptions = Record<
  "unproxiedPlugins" | "plugins" | "themes",
  boolean
>;
export async function importData(
  save: DBSave.Save,
  options: SyncImportOptions,
) {
  if (!save) return;
  importCallback?.(true);

  const iplugins = [
    ...save.sync.plugins.filter(
      (x) =>
        !plugins[x.id] &&
        !isPluginProxied(x.id) &&
        canImport(x.id) &&
        options.unproxiedPlugins,
    ),
    ...save.sync.plugins.filter(
      (x) =>
        !plugins[x.id] &&
        isPluginProxied(x.id) &&
        canImport(x.id) &&
        options.plugins,
    ),
  ];
  const ithemes = save.sync.themes.filter(
    (x) => !themes[x.id] && options.themes,
  );

  if (!iplugins[0] && !ithemes[0]) {
    importCallback?.(false);
    return showToast(
      lang.format("toast.sync.no_import", {}),
      getAssetIDByName("Small"),
    );
  }

  clearLogs();
  addLog(
    "importer",
    lang.format("log.import.start.combo", {
      plugins: plural(iplugins.length),
      themes: plural(ithemes.length),
    }),
  );

  if (!isInPage)
    showToast(
      lang.format("log.import.start.combo", {
        plugins: plural(iplugins.length),
        themes: plural(ithemes.length),
      }),
      getAssetIDByName("toast_image_saved"),
    );

  const status = { plugins: 0, themes: 0, fPlugins: 0, fThemes: 0 };
  await Promise.all([
    ...iplugins.map(
      (x) =>
        new Promise<void>((res) => {
          RNMMKVManager.setItem(x.id, JSON.stringify(x.options));
          installPlugin(x.id, x.enabled)
            .then(() => {
              status.plugins++;
              addLog(
                "plugins",
                lang.format("log.import.plugin.success", { name: x.id }),
              );
            })
            .catch((e) => {
              status.fPlugins++;
              addLog(
                "plugins",
                lang.format("log.import.plugin.fail", { name: x.id, error: e }),
              );
            })
            .finally(res);
        }),
    ),
    ...ithemes.map(
      (x) =>
        new Promise<void>((res) =>
          installTheme(x.id)
            .then(() => {
              status.themes++;
              addLog(
                "themes",
                lang.format("log.import.theme.success", { name: x.id }),
              );
            })
            .catch((e) => {
              status.fThemes++;
              addLog(
                "themes",
                lang.format("log.import.theme.fail", { name: x.id, error: e }),
              );
            })
            .finally(res),
        ),
    ),
  ]);

  if (!isInPage)
    showToast(
      lang.format("log.import.total", {
        plugins: plural(status.plugins),
        themes: plural(status.themes),
      }),
      getAssetIDByName("Check"),
    );

  const selectTheme = themes[ithemes.find((x) => x.enabled)?.id];
  if (selectTheme) {
    addLog(
      "themes",
      lang.format("log.import.select_theme", { theme: selectTheme.id }),
    );
    await createFileBackend("vendetta_theme.json").set(
      Object.assign(selectTheme, {
        selected: true,
      }),
    );

    await (() =>
      new Promise<void>((res) =>
        showConfirmationAlert({
          title: lang.format("alert.change_theme.title", {}),
          content: lang.format("alert.change_theme.body", {}),
          confirmText: lang.format("alert.change_theme.confirm", {}),
          confirmColor: "red" as ButtonColors,
          onConfirm: () => {
            RNBundleUpdaterManager.reload();
            res();
          },
          cancelText: lang.format("alert.change_theme.cancel", {}),
          onCancel: res,
          isDismissable: true,
        }),
      ))();
  }

  addLog(
    "importer",
    status.fPlugins || status.fThemes
      ? lang.format("log.import.result.fail", {
          plugins: plural(status.plugins),
          themes: plural(status.themes),
          failed_plugins: plural(status.fPlugins),
          failed_themes: plural(status.fThemes),
        })
      : lang.format("log.import.result.success", {
          plugins: plural(status.plugins),
          themes: plural(status.themes),
        }),
  );
  importCallback?.(false);
}
