import { findByName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { resolveSemanticColor } from "../../../../stuff/types";
import textIconBase from "../../assets/NSFWChannelTag/text/iconBase.png";
import textIconOverlay from "../../assets/NSFWChannelTag/text/iconOverlay.png";
import voiceIconBase from "../../assets/NSFWChannelTag/voice/iconBase.png";
import voiceIconOverlay from "../../assets/NSFWChannelTag/voice/iconOverlay.png";
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
            const images = [
              {
                match: ["TextWarningIcon", "ic_text_channel_nsfw_16px"],
                base: textIconBase,
                overlay: textIconOverlay,
              },
              {
                match: [
                  "VoiceWarningIcon",
                  "ic_voice_channel_nsfw_16px",
                  "ic_voice_channel_nsfw_24px",
                ],
                base: voiceIconBase,
                overlay: voiceIconOverlay,
              },
            ];

            const image = images.find((x) =>
              x.match.some((y) => getAssetIDByName(y) === source),
            );
            if (image)
              return React.createElement(
                RN.View,
                {},
                React.createElement(RN.Image, {
                  style: RN.StyleSheet.flatten(style),
                  source: { uri: image.base },
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
                    source: { uri: image.overlay },
                  }),
                ),
              );
          },
        ),
      );
    },
    onStop() {},
  },
});
