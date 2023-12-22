import { clipboard, React, url } from "@vendetta/metro/common";
import { plugins } from "@vendetta/plugins";
import { installPlugin, removePlugin } from "@vendetta/plugins";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import CustomBadgeTag from "../../../../stuff/components/CustomBadgeTag";
import SmartMention from "../../../../stuff/components/SmartMention";
import { SimpleText } from "../../../../stuff/types";
import { matchGithubLink, properLink, refetchPlugin } from "../stuff/util";
import { PluginsFullJson } from "../types";
import usePlugin from "./hooks/usePlugin";
import ScuffedPluginCard from "./ScuffedPluginCard";

const { View } = General;

export default function ({
  item,
  changes,
}: {
  item: PluginsFullJson[number];
  changes: [string, "new" | "update"][];
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
        showToast("Copied GitHub link", getAssetIDByName("toast_copy_link"));
      },
    });

  return (
    <ScuffedPluginCard
      headerLabel={
        <View style={{ flexDirection: "row" }}>
          {change && (
            <CustomBadgeTag text={change[1] === "new" ? "New" : "Upd"} />
          )}
          <SimpleText variant="text-md/semibold" color="HEADER_PRIMARY">
            {item.name}
            {item.authors[0] && " by "}
            {...item.authors.map((x, i, a) => (
              <>
                <SmartMention userId={x.id} color="TEXT_LINK">
                  {x.name}
                </SmartMention>
                {i !== a.length - 1 && ", "}
              </>
            ))}
          </SimpleText>
        </View>
      }
      headerIcon={getAssetIDByName(item.vendetta.icon)}
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
                            `Successfully updated ${item.name}`,
                            getAssetIDByName("ic_sync_24px"),
                          ),
                        )
                        .catch(() =>
                          showToast(
                            `Failed to update ${item.name}!`,
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
                          `Successfully deleted ${item.name}`,
                          getAssetIDByName("ic_message_delete"),
                        );
                      } catch {
                        showToast(
                          `Failed to delete ${item.name}!`,
                          getAssetIDByName("Small"),
                        );
                      }
                      setPluginProgress(false);
                    },
                    onLongPress: () => {
                      clipboard.setString(item.vendetta.original);
                      showToast(
                        "Copied unproxied link",
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
                            `Successfully installed ${item.name}`,
                            getAssetIDByName("toast_image_saved"),
                          );
                        })
                        .catch((e: any) =>
                          showToast(
                            e?.message ?? `Failed to install ${item.name}!`,
                            getAssetIDByName("Small"),
                          ),
                        )
                        .finally(() => setPluginProgress(false));
                    },
                    onLongPress: () => {
                      clipboard.setString(item.vendetta.original);
                      showToast(
                        "Copied unproxied link",
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
