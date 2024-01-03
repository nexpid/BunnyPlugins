import { findByName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { resolveSemanticColor } from "../../../../stuff/types";
import iconBase from "../../assets/NSFWChannelTag/iconBase.png";
import iconOverlay from "../../assets/NSFWChannelTag/iconOverlay.png";
import NSFWBadge from "../components/modules/NSFWChannelTag/NSFWBadge";
import { Module, ModuleCategory } from "../stuff/Module";

const ChannelInfo = findByName("ChannelInfo", false);

export default new Module({
  id: "nsfw-channel-tag",
  label: "NSFW Channel Tag",
  sublabel: "Adds a red NSFW tag next to an NSFW channel",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("ic_gif_24px"),
  handlers: {
    onStart() {
      this.patches.add(
        after("default", ChannelInfo, ([{ channel }], ret) =>
          React.createElement(
            React.Fragment,
            {},
            channel.nsfw_ &&
              React.createElement(NSFWBadge, {
                padding: !!ret,
              }),
            ret,
          ),
        ),
      );
      this.patches.add(
        after(
          "render",
          RN.Image,
          ([{ source, style }]: [{ source: number; style: any }]) => {
            if (
              [
                getAssetIDByName("TextWarningIcon"),
                getAssetIDByName("ic_text_channel_nsfw_16px"),
              ].includes(source)
            )
              return React.createElement(
                RN.View,
                {},
                React.createElement(
                  React.Fragment,
                  {},
                  React.createElement(RN.Image, {
                    style: RN.StyleSheet.flatten(style),
                    source: { uri: iconBase },
                  }),
                  React.createElement(
                    RN.View,
                    {
                      style: { position: "absolute", right: 0, bottom: 0 },
                    },
                    React.createElement(RN.Image, {
                      style: {
                        ...RN.StyleSheet.flatten(style),
                        tintColor: resolveSemanticColor(
                          semanticColors.STATUS_DANGER,
                        ),
                      },
                      source: { uri: iconOverlay },
                    }),
                  ),
                ),
              );
          },
        ),
      );
    },
    onStop() {},
  },
});
