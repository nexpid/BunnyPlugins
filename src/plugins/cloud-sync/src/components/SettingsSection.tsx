import { NavigationNative } from "@vendetta/metro/common";
import { manifest } from "@vendetta/plugin";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary, Forms } from "@vendetta/ui/components";

import { lang } from "..";
import Settings from "./Settings";

const { FormRow } = Forms;

export default () => {
    const navigation = NavigationNative.useNavigation();

    // not sure if ErrorBoundary is even required but i'll keep it here just in case
    return (
        <ErrorBoundary>
            <FormRow
                label={lang.format("plugin.name", {})}
                leading={
                    <FormRow.Icon
                        source={getAssetIDByName(manifest.vendetta.icon)}
                    />
                }
                trailing={FormRow.Arrow}
                onPress={() =>
                    navigation.push("VendettaCustomPage", {
                        title: lang.format("plugin.name", {}),
                        render: Settings,
                    })
                }
            />
        </ErrorBoundary>
    );
};
