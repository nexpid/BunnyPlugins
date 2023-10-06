import { Forms } from "@vendetta/ui/components";
import { AutoRow } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";

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
