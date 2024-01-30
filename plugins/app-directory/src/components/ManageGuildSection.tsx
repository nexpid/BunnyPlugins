import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

import AutoRow from "$/components/AutoRow";

const { FormSection } = Forms;

export default function ({ run }: { run: () => void }) {
  return (
    <FormSection title="Apps">
      <AutoRow
        label="App Directory"
        icon={getAssetIDByName("ic_robot_24px")}
        onPress={run}
      />
    </FormSection>
  );
}
