import { HTTP_REGEX_MULTI, PROXY_PREFIX } from "@vendetta/constants";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { FluxDispatcher, ReactNative as RN } from "@vendetta/metro/common";
import { before, instead } from "@vendetta/patcher";
import { installPlugin, plugins, removePlugin } from "@vendetta/plugins";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { androidifyColor, resolveSemanticColor } from "$/types";

import { Module, ModuleCategory } from "../stuff/Module";

// credits to @fres621, most codedLinks stuff was stolen from them :3

const DCDChatManager = RN.NativeModules.DCDChatManager;
const MessageStore = findByStoreName("MessageStore");

const codedLinksCache = {} as Record<string, Record<number, string>>;
const { MessagesHandlers } = findByProps("MessagesHandlers");

type Iterable = {
  content: string | Iterable | Iterable[];
  [k: PropertyKey]: any;
};

let pluginInstallingCache = {} as Record<string, boolean>;
let pluginMessageCache = {} as Record<string, [string, string][]>;
const updateMessages = (plugin: string, installing?: boolean) => {
  if (installing !== undefined) pluginInstallingCache[plugin] = installing;

  if (pluginMessageCache[plugin]) {
    for (const [id, channel] of pluginMessageCache[plugin]) {
      const message = MessageStore.getMessage(channel, id);
      if (message) {
        FluxDispatcher.dispatch({
          type: "MESSAGE_UPDATE",
          message: {
            ...message,
            content: message.content.endsWith(" ")
              ? message.content.slice(0, -1)
              : message.content + " ",
          },
          log_edit: false,
        });
      }
    }
  }
};

const pluginInfoCache = {} as Record<string, PluginManifest | null>;
const getPluginInfo = (
  plugin: string,
): {
  res: PluginManifest | null | false;
  promise?: Promise<PluginManifest | null>;
} => {
  if (pluginInfoCache[plugin] !== undefined)
    return { res: pluginInfoCache[plugin] };

  if (plugins[plugin])
    return {
      res: (pluginInfoCache[plugin] = plugins[plugin].manifest),
    };

  // suffer
  return {
    res: false,
    promise: (async () => {
      try {
        pluginInfoCache[plugin] = await (
          await fetch(`${plugin}manifest.json`, {
            headers: { "cache-control": "public; max-age=30" },
          })
        ).json();
      } catch (e) {
        pluginInfoCache[plugin] = null;
      }
      updateMessages(plugin);
      return pluginInfoCache[plugin];
    })(),
  };
};

const getCodedLink = (plugin: string) => {
  const obj = {
    borderColor: 0,
    backgroundColor: androidifyColor(
      resolveSemanticColor(semanticColors.BACKGROUND_SECONDARY),
    ),
    thumbnailCornerRadius: 0,
    headerColor: androidifyColor(
      resolveSemanticColor(semanticColors.HEADER_PRIMARY),
    ),
    headerText: "",
    acceptLabelBackgroundColor: 0,
    titleText: "",
    type: null,
    extendedType: 4,
    participantAvatarUris: [],
    acceptLabelText: "",
    noParticipantsText: "",
    ctaEnabled: false,
    plugin,
  };

  const info = getPluginInfo(plugin).res;
  const installing = pluginInstallingCache[plugin];

  if (info === false) {
    obj.headerText = "...";
  } else if (info === null) {
    obj.headerText = "unknown plugin";
  } else {
    obj.titleText = info.name;
    obj.noParticipantsText = `\n${info.description}`;
    obj.ctaEnabled = !installing;

    const has = !!plugins[plugin];
    obj.acceptLabelBackgroundColor = androidifyColor(
      resolveSemanticColor(
        !has || installing
          ? semanticColors.BUTTON_POSITIVE_BACKGROUND
          : semanticColors.BUTTON_DANGER_BACKGROUND,
      ),
    );
    obj.acceptLabelText = installing
      ? "..."
      : has
        ? "Uninstall Plugin"
        : "Install Plugin";
  }

  return obj;
};

export default new Module({
  id: "plugin-embeds",
  label: "Plugin Embeds",
  sublabel:
    "Shows an embed with plugin info when a plugin link is sent in chat",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("share"),
  handlers: {
    onStart() {
      this.patches.add(
        before("updateRows", DCDChatManager, (args) => {
          const rows = JSON.parse(args[1]);
          for (const row of rows) {
            const plugins = new Array<string>();

            const iterate = (thing: Iterable | Iterable[]) =>
              (Array.isArray(thing) ? thing : [thing]).forEach((x) => {
                if (typeof x.content === "string") {
                  for (const url of x.content.match(HTTP_REGEX_MULTI) ?? [])
                    if (
                      url.toLowerCase().startsWith(PROXY_PREFIX.toLowerCase())
                    )
                      plugins.push(!url.endsWith("/") ? `${url}/` : url);
                } else if (typeof x.content === "object" && x.content !== null)
                  return iterate(x.content);
              });

            if (row.message) {
              if (row.message.content) iterate(row.message.content);

              for (const [plug, ids] of Object.entries(pluginMessageCache))
                if (
                  ids.find((x) => x[0] === row.message.id) &&
                  !plugins.includes(plug)
                )
                  ids.length === 1
                    ? delete pluginMessageCache[plug]
                    : (pluginMessageCache[plug] = ids.filter(
                        (x) => x[0] !== row.message.id,
                      ));

              if (plugins[0]) codedLinksCache[row.message.id] = {};
              for (const plugin of plugins) {
                pluginMessageCache[plugin] ??= [];
                if (
                  !pluginMessageCache[plugin].find(
                    (x) => x[0] === row.message.id,
                  )
                )
                  pluginMessageCache[plugin].push([
                    row.message.id,
                    row.message.channelId,
                  ]);

                row.message.codedLinks ??= [];
                codedLinksCache[row.message.id][
                  row.message.codedLinks.push(getCodedLink(plugin)) - 1
                ] = plugin;
              }
            }
          }

          args[1] = JSON.stringify(rows);
        }),
      );

      const patchHandlers = (handlers: any) => {
        if (handlers.__ple_patched) return;
        handlers.__ple_patched = true;

        if (
          Object.prototype.hasOwnProperty.call(handlers, "handleTapInviteEmbed")
        )
          this.patches.add(
            instead("handleTapInviteEmbed", handlers, (args, orig) => {
              const [
                {
                  nativeEvent: { index, messageId },
                },
              ] = args;
              const plugin = codedLinksCache[messageId]?.[index];
              if (!plugin) return orig.call(this, ...args);

              const has = !!plugins[plugin];
              if (has) {
                try {
                  removePlugin(plugin);
                } catch (e) {
                  console.log(e);
                  showToast(
                    "Failed to uninstall plugin!",
                    getAssetIDByName("Small"),
                  );
                }
                updateMessages(plugin, false);
              } else {
                updateMessages(plugin, true);
                installPlugin(plugin)
                  .then(() =>
                    showToast(
                      `Successfully installed ${plugins[plugin].manifest.name}.`,
                      getAssetIDByName("Check"),
                    ),
                  )
                  .catch((e) => {
                    console.log(e);
                    showToast(
                      "Failed to install plugin!",
                      getAssetIDByName("Small"),
                    );
                  })
                  .finally(() => updateMessages(plugin, false));
              }
            }),
          );

        this.patches.add(() => (handlers.__ple_patched = false));
      };

      const origGetParams = Object.getOwnPropertyDescriptor(
        MessagesHandlers.prototype,
        "params",
      )!.get;
      origGetParams &&
        Object.defineProperty(MessagesHandlers.prototype, "params", {
          configurable: true,
          get() {
            if (this) patchHandlers(this);
            return origGetParams.call(this);
          },
        });

      this.patches.add(
        () =>
          origGetParams &&
          Object.defineProperty(MessagesHandlers.prototype, "params", {
            configurable: true,
            get: origGetParams,
          }),
      );
    },
    onStop() {
      pluginInstallingCache = {};
      pluginMessageCache = {};
    },
  },
});
