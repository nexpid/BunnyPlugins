import { NavigationNative } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary, Forms } from "@vendetta/ui/components";

import Text from "$/components/Text";
import TextBadge from "$/components/TextBadge";

import { lang } from "..";
import PluginBrowserPage from "./pages/PluginBrowserPage";

const { FormRow } = Forms;

export default ({ changes }: { changes: number }) => {
    const navigation = NavigationNative.useNavigation();

    return (
        <ErrorBoundary>
            <FormRow
                label={
                    <>
                        <Text variant="text-md/semibold" color="HEADER_PRIMARY">
                            {lang.format("plugin.name", {})}
                        </Text>
                        {changes && (
                            <TextBadge variant="danger">{changes}</TextBadge>
                        )}
                    </>
                }
                leading={
                    <FormRow.Icon
                        source={getAssetIDByName("ic_search_items_24px")}
                    />
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
