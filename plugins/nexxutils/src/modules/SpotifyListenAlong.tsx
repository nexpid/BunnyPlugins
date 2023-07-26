import { findByName } from "@vendetta/metro";
import { Module, ModuleCategory } from "../stuff/Module";
import { after, before } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";
import ListenAlongButton from "../components/modules/SpotifyListenAlong/ListenAlongButton";
import { getAssetIDByName } from "@vendetta/ui/assets";

const UserProfileSection = findByName("UserProfileSection", false);

export default new Module({
  id: "spotify-listen-along",
  label: "Add Listen Along",
  sublabel: "Adds a Listen Along button to Spotify activites",
  category: ModuleCategory.Fixes,
  icon: getAssetIDByName("ic_music"),
  extra: {
    credits: ["1034579679526526976"],
  },
  runner: {
    onStart() {
      this.patches.add(
        before("default", UserProfileSection, ([arg]) => {
          if (arg.title?.toLowerCase().includes("spotify")) {
            const actions = findInReactTree(
              arg.children,
              (x) => x?.type?.name === "Actions"
            );

            if (actions) {
              const { activityButtonColor, activity, user } = actions.props;
              if (activityButtonColor && activity && user)
                this.patches.add(
                  after(
                    "type",
                    actions,
                    (_, ret) =>
                      (ret.props.children = [
                        ret.props.children,
                        <ListenAlongButton
                          background={activityButtonColor}
                          activity={activity}
                          user={user}
                        />,
                      ]),
                    true
                  )
                );
            } else console.log("no actions :(");
          }
        })
      );
    },
    onStop() {},
  },
});
