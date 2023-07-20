import { General } from "@vendetta/ui/components";
import { PluginsFullJson } from "../types";
import ScuffedPluginCard from "./ScuffedPluginCard";
import CustomBadgeTag from "../../../../stuff/components/CustomBadgeTag";
import { SimpleText } from "../../../../stuff/types";
import { matchGithubLink, refetchPlugin } from "..";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { plugins } from "@vendetta";
import { React, url } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { installPlugin, removePlugin, startPlugin } from "@vendetta/plugins";
import SmartMention from "../../../../stuff/components/SmartMention";

const { View } = General;

export default function ({
  item,
  index,
  changes,
}: {
  item: PluginsFullJson[number];
  index: number;
  changes: [string, "new" | "update"][];
}) {
  const proxiedLink = `https://vd-plugins.github.io/proxy/${item.vendetta.original}`;

  const [hasPlugin, setHasPlugin] = React.useState(
    !!plugins.plugins[proxiedLink]
  );

  const change = changes.find((x) => x[0] === proxiedLink);

  const githubLink = matchGithubLink(item.vendetta.original);
  const githubBtn = githubLink && {
    icon: getAssetIDByName("img_account_sync_github_white"),
    onPress: () => url.openURL(githubLink),
  };

  return (
    <ScuffedPluginCard
      index={index}
      headerLabel={
        <View style={{ flexDirection: "row" }}>
          {change && (
            <CustomBadgeTag text={change[1] === "new" ? "New" : "Upd"} />
          )}
          <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
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
      actions={() => {
        if (proxiedLink.includes("plugin-browser")) return [githubBtn];

        return hasPlugin
          ? [
              plugins.plugins[proxiedLink] &&
                plugins.plugins[proxiedLink].manifest.hash !== item.hash && {
                  icon: getAssetIDByName("ic_sync_24px"),
                  onPress: () => {
                    refetchPlugin(proxiedLink)
                      .then(() => {
                        showToast(
                          `Successfully updated ${item.name}`,
                          getAssetIDByName("ic_sync_24px")
                        );
                        setHasPlugin(true);
                      })
                      .catch(() =>
                        showToast(
                          `Failed to update ${item.name}!`,
                          getAssetIDByName("Small")
                        )
                      );
                  },
                },
              {
                icon: getAssetIDByName("ic_message_delete"),
                destructive: true,
                onPress: async () => {
                  try {
                    removePlugin(proxiedLink);
                    showToast(
                      `Successfully deleted ${item.name}`,
                      getAssetIDByName("ic_message_delete")
                    );
                    setHasPlugin(false);
                  } catch {
                    showToast(
                      `Failed to delete ${item.name}!`,
                      getAssetIDByName("Small")
                    );
                  }
                },
              },
              githubBtn,
            ].filter((x) => !!x)
          : [
              {
                icon: getAssetIDByName("ic_download_24px"),
                onPress: async () => {
                  installPlugin(proxiedLink, false)
                    .then(() => {
                      showToast(
                        `Successfully installed ${item.name}`,
                        getAssetIDByName("toast_image_saved")
                      );
                      setHasPlugin(true);
                      startPlugin(proxiedLink);
                    })
                    .catch((e: any) =>
                      showToast(
                        e?.message ?? `Failed to install ${item.name}!`,
                        getAssetIDByName("Small")
                      )
                    );
                },
              },
              githubBtn,
            ].filter((x) => !!x);
      }}
    />
  );
}
