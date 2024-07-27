// https://raw.githubusercontent.com/pyoncord/Bunny/9809ef2cd4864d4f308c37016743f7d157e0ce3c/src/lib/ui/components/Search.tsx
// this is a modified version with some plugin browser specific changes

import { i18n, React, ReactNative as RN } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary } from "@vendetta/ui/components";

import { IconButton, TextInput } from "$/lib/redesign";
import { resolveSemanticColor } from "$/types";

function SearchIcon() {
    return (
        <RN.Image
            style={{
                width: 16,
                height: 16,
                tintColor: resolveSemanticColor(
                    semanticColors.INTERACTIVE_NORMAL,
                ),
            }}
            source={getAssetIDByName("search")}
        />
    );
}

export default ({
    onChangeText,
    onPressFilters,
}: {
    onChangeText: (v: string) => void;
    onPressFilters: () => void;
}) => {
    const [query, setQuery] = React.useState("");

    const onChange = (value: string) => {
        setQuery(value);
        onChangeText(value);
    };

    return (
        <ErrorBoundary>
            <RN.View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 5,
                }}>
                <RN.View
                    style={{
                        flexGrow: 1,
                    }}>
                    <TextInput
                        grow
                        isClearable
                        leadingIcon={SearchIcon}
                        placeholder={i18n.Messages.SEARCH}
                        onChange={onChange}
                        returnKeyType={"search"}
                        size="md"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={query}
                        isRound
                    />
                </RN.View>
                <IconButton
                    onPress={onPressFilters}
                    icon={getAssetIDByName("FiltersHorizontalIcon")}
                    size="md"
                    variant="secondary"
                />
            </RN.View>
        </ErrorBoundary>
    );
};
