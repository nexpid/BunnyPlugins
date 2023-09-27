import { React } from "@vendetta/metro/common";
import { findByName, findByProps } from "@vendetta/metro";
import { Module, ModuleCategory } from "../stuff/Module";
import { after, before } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { findInReactTree } from "@vendetta/utils";
import ListenAlongButton from "../components/modules/SpotifyListenAlong/ListenAlongButton";

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
          });
        })
      );
      this.patches.add(
        before("default", UserProfileSection, ([arg]) => {
          if (arg.title?.includes("Spotify")) {
            const actions = findInReactTree(
              arg.children,
              (x) => x?.type?.name === "Actions"
            );

            if (actions)
              this.patches.add(
                before(
                  "type",
                  actions,
                  ([a]) => (a.activity.user = a.user),
                  true
                )
              );
          }
        })
      );
    },
    onStop() {},
  },
});
