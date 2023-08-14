import { getAssetIDByName } from "@vendetta/ui/assets";
import { Module, ModuleCategory } from "../stuff/Module";
import { findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { SimpleText } from "../../../../stuff/types";

const PendingGuildJoinRequestsFolder = findByName(
  "PendingGuildJoinRequestsFolder",
  false
);

export default new Module({
  id: "test",
  label: "Test",
  sublabel: "Testing module",
  category: ModuleCategory.Fixes,
  icon: getAssetIDByName("ic_message_edit"),
  runner: {
    onStart() {
      this.patches.add(
        after("default", PendingGuildJoinRequestsFolder, () => (
          <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
            PENIS
          </SimpleText>
        ))
      );
    },
    onStop() {},
  },
});
