export interface LangValues {
  cloud_sync: {
    values: typeof import("./values/base/cloud_sync.json");
    fillers: {
      "combo.plugins.plural": ["$count"];
      "combo.themes.plural": ["$count"];
      "toast.backup_saved": ["$file"];
      "toast.errored": ["$error"];
      "sheet.import_data.unproxied_plugins": ["$count"];
      "sheet.import_data.plugins": ["$count"];
      "sheet.import_data.themes": ["$count"];
      "log.import.start.combo": ["$plugins", "$themes"];
      "log.import.plugin.success": ["$name"];
      "log.import.plugin.fail": ["$name", "$error"];
      "log.import.theme.success": ["$name"];
      "log.import.theme.fail": ["$name", "$error"];
      "log.import.total": ["$plugins", "$themes"];
      "log.import.select_theme": ["$theme"];
      "log.import.result.success": ["$plugins", "$themes"];
      "log.import.result.fail": [
        "$plugins",
        "$themes",
        "$failed_plugins",
        "$failed_themes",
      ];
    };
  };
  plugin_browser: {
    values: typeof import("./values/base/plugin_browser.json");
    fillers: {
      "plugin.name.changes": ["$changes"];
      "toast.plugin.update.success": ["$plugin"];
      "toast.plugin.update.fail": ["$plugin"];
      "toast.plugin.delete.success": ["$plugin"];
      "toast.plugin.delete.fail": ["$plugin"];
      "toast.plugin.install.success": ["$plugin"];
      "toast.plugin.install.fail": ["$plugin"];
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
