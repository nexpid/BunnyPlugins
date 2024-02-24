import { findByName, findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { after, before } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { findInReactTree } from "@vendetta/utils";

import ListenAlongButton from "../components/modules/SpotifyListenAlong/ListenAlongButton";
import { Module, ModuleCategory } from "../stuff/Module";

const { SpotifyPlayButton } = findByProps("SpotifyPlayButton");
const UserProfileSection = findByName("UserProfileSection", false);

export default new Module({
  id: "spotify-listen-along",
  label: "Add Listen Along",
  sublabel: "Adds a Listen Along button to Spotify activites",
  category: ModuleCategory.Useful,
  icon: getAssetIDByName("ic_music"),
  extra: {
    credits: ["1001086404203389018"],
  },
  settings: {
    redesigned: {
      label: "Redesigned Icon",
      subLabel: "Uses the new redesigned Listen along icon",
      type: "toggle",
      default: true,
    },
  },
  handlers: {
    onStart() {
      this.patches.add(
        after("render", SpotifyPlayButton.prototype, (_, ret) => {
          const aprops = ret?._owner?.stateNode?.props;
          if (!aprops?.activity?.user) return;

          const ath = ret.props;
          return React.createElement(ListenAlongButton, {
            button: ath,
            activity: aprops.activity,
            user: aprops.activity.user,
            redesigned: this.storage.options.redesigned,
          });
        }),
      );
      this.patches.add(
        before("default", UserProfileSection, ([arg]) => {
          if (arg.title?.includes("Spotify")) {
            const actions = findInReactTree(
              arg.children,
              (x) => x?.type?.name === "Actions",
            );

            if (actions)
              this.patches.add(
                before(
                  "type",
                  actions,
                  ([a]) => (a.activity.user = a.user),
                  true,
                ),
              );
          }
        }),
      );
    },
    onStop() {},
  },
});
