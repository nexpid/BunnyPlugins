import { NavigationNative } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary, Forms } from "@vendetta/ui/components";
import Settings from "./Settings";

const { FormRow } = Forms;

export default () => {
  const navigation = NavigationNative.useNavigation();

  // not sure if ErrorBoundary is even required but i'll keep it here just in case
  return (
    <ErrorBoundary>
      <FormRow
        label="Cloud Sync"
        leading={<FormRow.Icon source={getAssetIDByName("ic_contact_sync")} />}
        trailing={FormRow.Arrow}
        onPress={() =>
          navigation.push("VendettaCustomPage", {
            title: "CloudSync",
            render: Settings,
          })
        }
      />
    </ErrorBoundary>
  );
};
