import { clipboard, React, url } from "@vendetta/metro/common";
import { plugins } from "@vendetta/plugins";
import { installPlugin, removePlugin } from "@vendetta/plugins";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { lang } from "..";
import { matchGithubLink, properLink, refetchPlugin } from "../stuff/util";
import { PluginsFullJson } from "../types";
import usePlugin from "./hooks/usePlugin";
import ScuffedPluginCard from "./ScuffedPluginCard";

export default function ({
  index,
  item,
  changes,
  highlight,
}: {
  index: number;
  item: PluginsFullJson[number];
  changes: [string, "new" | "update"][];
  highlight: string;
}) {
  const proxiedLink = properLink(
    `https://vd-plugins.github.io/proxy/${item.vendetta.original}`,
  );

  const [pluginProgress, setPluginProgress] = React.useState(false);
  const hasPlugin = usePlugin(proxiedLink);

  const change = changes.find((x) => x[0] === proxiedLink);

  const githubLink = matchGithubLink(item.vendetta.original);
  const append = [];
  if (githubLink)
    append.push({
      icon: getAssetIDByName("img_account_sync_github_white"),
      onPress: () => url.openURL(githubLink),
      onLongPress: () => {
        clipboard.setString(githubLink);
        showToast(
          lang.format("toast.copy.github_link", {}),
          getAssetIDByName("toast_copy_link"),
        );
      },
    });

  return (
    <ScuffedPluginCard
      index={index}
      update={change && (change[1] === "new" ? "New" : "Upd")}
      headerLabel={item.name}
      headerSublabel={
        item.authors?.[0] && `by ${item.authors.map((i) => i.name).join(", ")}`
      }
      headerIcon={item.vendetta?.icon || "ic_application_command_24px"}
      highlight={highlight}
      descriptionLabel={item.description}
      actions={
        pluginProgress
          ? []
          : proxiedLink.includes("plugin-browser")
            ? append
            : hasPlugin
              ? [
                  plugins[proxiedLink]?.manifest.hash !== item.hash && {
                    icon: getAssetIDByName("ic_sync_24px"),
                    onPress: () => {
                      setPluginProgress(true);
                      refetchPlugin(proxiedLink)
                        .then(() =>
                          showToast(
                            lang.format("toast.plugin.update.success", {
                              plugin: item.name,
                            }),
                            getAssetIDByName("ic_sync_24px"),
                          ),
                        )
                        .catch(() =>
                          showToast(
                            lang.format("toast.plugin.update.fail", {
                              plugin: item.name,
                            }),
                            getAssetIDByName("Small"),
                          ),
                        )
                        .finally(() => setPluginProgress(false));
                    },
                  },
                  {
                    icon: getAssetIDByName("ic_message_delete"),
                    destructive: true,
                    onPress: async () => {
                      setPluginProgress(true);
                      try {
                        removePlugin(proxiedLink);
                        showToast(
                          lang.format("toast.plugin.delete.success", {
                            plugin: item.name,
                          }),
                          getAssetIDByName("ic_message_delete"),
                        );
                      } catch {
                        showToast(
                          lang.format("toast.plugin.delete.fail", {
                            plugin: item.name,
                          }),
                          getAssetIDByName("Small"),
                        );
                      }
                      setPluginProgress(false);
                    },
                    onLongPress: () => {
                      clipboard.setString(item.vendetta.original);
                      showToast(
                        lang.format("toast.copy.unproxied_link", {}),
                        getAssetIDByName("toast_copy_link"),
                      );
                    },
                  },
                  ...append,
                ].filter((x) => !!x)
              : [
                  {
                    icon: getAssetIDByName("ic_download_24px"),
                    onPress: async () => {
                      setPluginProgress(true);
                      installPlugin(proxiedLink, true)
                        .then(() => {
                          showToast(
                            lang.format("toast.plugin.install.success", {
                              plugin: item.name,
                            }),
                            getAssetIDByName("toast_image_saved"),
                          );
                        })
                        .catch((e: any) =>
                          showToast(
                            e?.message ??
                              lang.format("toast.plugin.install.fail", {
                                plugin: item.name,
                              }),
                            getAssetIDByName("Small"),
                          ),
                        )
                        .finally(() => setPluginProgress(false));
                    },
                    onLongPress: () => {
                      clipboard.setString(item.vendetta.original);
                      showToast(
                        lang.format("toast.copy.unproxied_link", {}),
                        getAssetIDByName("toast_copy_link"),
                      );
                    },
                  },
                  ...append,
                ]
      }
      loading={pluginProgress}
    />
  );
}
