import { React, ReactNative as RN } from "@vendetta/metro/common";
import { plugins } from "@vendetta/plugins";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, Search } from "@vendetta/ui/components";

import { buttonVariantPolyfill, IconButton } from "$/lib/redesign";
import { managePage } from "$/lib/ui";

import { lang, vstorage } from "../..";

const { FormCheckboxRow, FormRow } = Forms;

export default function IgnoredPluginsPage() {
    const [search, setSearch] = React.useState("");
    const [_, forceUpdate] = React.useReducer(x => ~x, 0);

    React.useEffect(() => {
        setSearch("");
    }, []);

    managePage(
        {
            title: lang.format("page.ignored_plugins.title", {}),
            headerRight: () => (
                <IconButton
                    onPress={() => {
                        showConfirmationAlert({
                            title: lang.format(
                                "alert.clear_ignored_plugins.title",
                                {},
                            ),
                            content: lang.format(
                                "alert.clear_ignored_plugins.body",
                                {},
                            ),
                            confirmText: lang.format(
                                "alert.clear_ignored_plugins.confirm",
                                {},
                            ),
                            confirmColor: "red" as ButtonColors,
                            onConfirm: () => {
                                vstorage.config.ignoredPlugins = [];
                                forceUpdate();
                            },
                        });
                    }}
                    disabled={vstorage.config.ignoredPlugins.length === 0}
                    icon={getAssetIDByName("TrashIcon")}
                    size="sm"
                    variant={
                        vstorage.config.ignoredPlugins.length === 0
                            ? "secondary"
                            : buttonVariantPolyfill().destructive
                    }
                />
            ),
        },
        undefined,
        vstorage.config.ignoredPlugins.length,
    );

    return (
        <RN.FlatList
            ListHeaderComponent={
                <Search
                    style={{ marginBottom: 10 }}
                    onChangeText={x => {
                        setSearch(x.toLowerCase());
                    }}
                />
            }
            style={{ paddingHorizontal: 10, paddingTop: 10 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            data={Object.entries(plugins).filter(x =>
                x[1].manifest.name.toLowerCase().includes(search),
            )}
            renderItem={({ item: [id, item] }) => {
                return (
                    <FormCheckboxRow
                        label={item.manifest.name}
                        leading={
                            <FormRow.Icon
                                source={getAssetIDByName(
                                    item.manifest.vendetta?.icon ?? "",
                                )}
                            />
                        }
                        onPress={() => {
                            if (vstorage.config.ignoredPlugins.includes(id))
                                vstorage.config.ignoredPlugins.splice(
                                    vstorage.config.ignoredPlugins.indexOf(id),
                                    1,
                                );
                            else vstorage.config.ignoredPlugins.push(id);
                            forceUpdate();
                        }}
                        selected={vstorage.config.ignoredPlugins.includes(id)}
                    />
                );
            }}
        />
    );
}
