import { NavigationNative } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary, Forms } from "@vendetta/ui/components";

import CustomBadgeTag from "$/components/CustomBadgeTag";
import SimpleText from "$/components/SimpleText";

import PluginBrowserPage from "./pages/PluginBrowserPage";

const { FormRow } = Forms;

export default ({ changes }: { changes: number }) => {
  const navigation = NavigationNative.useNavigation();

  return (
    <ErrorBoundary>
      <FormRow
        label={
          <SimpleText variant="text-md/semibold" color="HEADER_PRIMARY">
            Plugin Browser
            {changes ? (
              <CustomBadgeTag text={changes.toString()} marginLeft={true} />
            ) : (
              <></>
            )}
          </SimpleText>
        }
        leading={
          <FormRow.Icon source={getAssetIDByName("ic_search_items_24px")} />
        }
        trailing={FormRow.Arrow}
        onPress={() =>
          navigation.push("VendettaCustomPage", {
            render: PluginBrowserPage,
          })
        }
      />
    </ErrorBoundary>
  );
};
