import {
    clipboard,
    React,
    ReactNative as RN,
    url,
} from "@vendetta/metro/common";
import { installPlugin, plugins, removePlugin } from "@vendetta/plugins";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import TextBadge from "$/components/TextBadge";

import { lang } from "..";
import constants from "../stuff/constants";
import { matchGithubLink, properLink } from "../stuff/util";
import { FullPlugin } from "../types";
import Card from "./Card";

export default function PluginCard({
    item,
    changes,
}: {
    item: FullPlugin;
    changes: string[];
}) {
    const proxiedLink = properLink(
        React.useMemo(() => {
            if (plugins[`https://${item.vendetta.original}`])
                return `https://${item.vendetta.original}`;
            else if (plugins[`http://${item.vendetta.original}`])
                return `http://${item.vendetta.original}`;
            else return `${constants.proxyUrl}${item.vendetta.original}`;
        }, []),
    );
    const githubLink = matchGithubLink(item.vendetta.original);
    const isNew = React.useMemo(
        () => changes.includes(properLink(item.vendetta.original)),
        [changes],
    );
    const isDisabled = !!item.bunny?.disabled;

    const [status, setStatus] = React.useState<{
        hasPlugin: boolean;
        pending: boolean;
    }>({
        hasPlugin: !!plugins[proxiedLink],
        pending: false,
    });
    const installFunction = async () => {
        if (status.pending || isDisabled) return;
        setStatus({
            hasPlugin: !!plugins[proxiedLink],
            pending: true,
        });

        const shouldRemove = !!plugins[proxiedLink];

        try {
            if (shouldRemove) removePlugin(proxiedLink);
            else await installPlugin(proxiedLink);
        } catch (e) {
            showToast(
                lang.format(
                    shouldRemove
                        ? "toast.plugin.delete.fail"
                        : "toast.plugin.install.fail",
                    { plugin: item.name },
                ),
                getAssetIDByName("CircleXIcon-primary"),
            );
        }

        showToast(
            lang.format(
                shouldRemove
                    ? "toast.plugin.delete.success"
                    : "toast.plugin.install.success",
                { plugin: item.name },
            ),
            getAssetIDByName(shouldRemove ? "TrashIcon" : "DownloadIcon"),
        );

        setStatus({
            hasPlugin: !!plugins[proxiedLink],
            pending: false,
        });
    };

    return (
        <Card
            headerLabel={item.name}
            headerSuffix={
                isNew && (
                    <TextBadge
                        variant="primary"
                        style={{ marginLeft: 4 }}
                        shiny>
                        {lang.format("browser.plugin.new", {})}
                    </TextBadge>
                )
            }
            highlight={!!isNew}
            headerSublabel={
                item.authors[0] &&
                `by ${item.authors.map(x => x.name).join(", ")}`
            }
            headerIcon={getAssetIDByName(item.vendetta.icon ?? "")}
            descriptionLabel={item.description}
            overflowTitle={item.name}
            actions={
                !isDisabled
                    ? [
                          {
                              icon: status.hasPlugin
                                  ? "TrashIcon"
                                  : "DownloadIcon",
                              disabled: status.pending,
                              loading: status.pending,
                              isDestructive: status.hasPlugin,
                              onPress: installFunction,
                          },
                      ]
                    : []
            }
            overflowActions={[
                ...(!isDisabled
                    ? [
                          {
                              label: lang.format(
                                  `sheet.plugin.${status.hasPlugin ? "un" : ""}install`,
                                  {},
                              ),
                              icon: status.hasPlugin
                                  ? "TrashIcon"
                                  : "DownloadIcon",
                              isDestructive: status.hasPlugin,
                              onPress: installFunction,
                          },
                      ]
                    : []),
                {
                    label: lang.format("sheet.plugin.copy_plugin_link", {}),
                    icon: "CopyIcon",
                    onPress: () => {
                        showToast(
                            lang.format("toast.copy_link", {}),
                            getAssetIDByName("CopyIcon"),
                        );
                        clipboard.setString(proxiedLink);
                    },
                },
                {
                    label: lang.format("sheet.plugin.copy_unproxied_link", {}),
                    icon: "CopyIcon",
                    onPress: () => {
                        showToast(
                            lang.format("toast.copy_link", {}),
                            getAssetIDByName("CopyIcon"),
                        );
                        clipboard.setString(
                            "https://" + item.vendetta.original,
                        );
                    },
                },
                ...(githubLink
                    ? [
                          {
                              label: lang.format(
                                  "sheet.plugin.open_github",
                                  {},
                              ),
                              icon: "img_account_sync_github_white",
                              onPress: async () => {
                                  showToast(
                                      lang.format("toast.open_link", {}),
                                      getAssetIDByName("LinkExternalSmallIcon"),
                                  );
                                  if (
                                      await RN.Linking.canOpenURL(
                                          "https://github.com",
                                      )
                                  ) {
                                      // the website redirects to the actual default branch, while the app doesn't
                                      // so we have to fix the link manually
                                      const { url } = await fetch(githubLink, {
                                          redirect: "follow",
                                      });
                                      RN.Linking.openURL(url);
                                  } else url.openURL(githubLink);
                              },
                          },
                      ]
                    : []),
            ]}
            disabled={isDisabled}
        />
    );
}
