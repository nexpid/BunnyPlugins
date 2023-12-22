import { findByName } from "@vendetta/metro";
import { i18n, React } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { Module, ModuleCategory } from "../stuff/Module";

const UserProfileRow = findByName("UserProfileRow", false);

export default new Module({
  id: "no-invite-to-servers",
  label: "No Invite to Servers",
  sublabel: "Removes the 'Invite to Servers' button from profiles",
  category: ModuleCategory.Fixes,
  icon: getAssetIDByName("icon-invite"),
  handlers: {
    onStart() {
      this.patches.add(
        after("default", UserProfileRow, (args, ret) =>
          args[0].label === i18n.Messages.GUILD_INVITE_CTA
            ? React.createElement(React.Fragment)
            : ret,
        ),
      );
    },
    onStop() {},
  },
});
