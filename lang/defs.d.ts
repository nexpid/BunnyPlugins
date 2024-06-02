export interface LangValues {
  cloud_sync: {
    values: typeof import("./values/base/cloud_sync.json");
    fillers: {
      plugins: { plugins: number };
      themes: { themes: number };
      "toast.backup_saved": { file: string };
      "toast.errored": { error: string };
      "sheet.import_data.unproxied_plugins": { count: string };
      "sheet.import_data.plugins": { count: string };
      "sheet.import_data.themes": { count: string };
      "log.import.start.combo": { plugins: string; themes: string };
      "log.import.plugin.success": { name: string };
      "log.import.plugin.fail": { name: string; error: string };
      "log.import.theme.success": { name: string };
      "log.import.theme.fail": { name: string; error: string };
      "log.import.total": { plugins: string; themes: string };
      "log.import.select_theme": { theme: string };
      "log.import.result.success": { plugins: string; themes: string };
      "log.import.result.fail": {
        plugins: string;
        themes: string;
        failed_plugins: string;
        failed_themes: string;
      };
    };
  };
  kiryu_facecam: {
    values: typeof import("./values/base/kiryu_facecam.json");
    fillers: null;
  };
  plugin_browser: {
    values: typeof import("./values/base/plugin_browser.json");
    fillers: {
      "toast.plugin.update.success": { plugin: string };
      "toast.plugin.update.fail": { plugin: string };
      "toast.plugin.delete.success": { plugin: string };
      "toast.plugin.delete.fail": { plugin: string };
      "toast.plugin.install.success": { plugin: string };
      "toast.plugin.install.fail": { plugin: string };
    };
  };
  themes_plus: {
    values: typeof import("./values/base/themes_plus.json");
    fillers: {
      "settings.header": { active: boolean };
      "alert.downloadpack.body": { iconpack: string; space: string };
    };
  };
  twemoji_everywhere: {
    values: typeof import("./values/base/twemoji_everywhere.json");
    fillers: null;
  };
  usrpfp: {
    values: typeof import("./values/base/usrpfp.json");
    fillers: null;
  };
}
