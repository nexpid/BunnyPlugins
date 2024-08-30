import { React, ReactNative as RN } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { safeFetch } from "@vendetta/utils";
import fuzzysort from "fuzzysort";

import { FlashList } from "$/deps";
import { managePage } from "$/lib/ui";

import { lang } from "../..";
import constants from "../../stuff/constants";
import { getChanges, run, updateChanges } from "../../stuff/pluginChecker";
import { properLink } from "../../stuff/util";
import { FullPlugin } from "../../types";
import PluginCard from "../PluginCard";
import Search from "../Search";

export enum Sort {
    DateNewest = "sheet.sort.date_newest",
    DateOldest = "sheet.sort.date_oldest",
    NameAZ = "sheet.sort.name_az",
    NameZA = "sheet.sort.name_za",
}

export default () => {
    const [parsed, setParsed] = React.useState<FullPlugin[] | null>(null);
    const [search, setSearch] = React.useState("");

    const [sort, setSort] = React.useState(Sort.DateNewest);

    const currentSetSort = React.useRef(setSort);
    currentSetSort.current = setSort;

    const changes = React.useRef(getChanges());

    const sortedData = React.useMemo(() => {
        if (!parsed) return [];

        if (search)
            return fuzzysort
                .go(search, parsed, {
                    keys: [
                        "vendetta.original",
                        "name",
                        "description",
                        "authors.0.name",
                        "authors.1.name",
                        "authors.2.name", // THREE authors
                    ],
                })
                .map(x => x.obj);

        let sorted = parsed.slice();
        if ([Sort.NameAZ, Sort.NameZA].includes(sort))
            sorted = sorted.sort((a, b) =>
                a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
            );
        if ([Sort.NameZA, Sort.DateNewest].includes(sort)) sorted.reverse();

        return sorted;
    }, [sort, parsed, search]);

    React.useEffect(() => {
        // when user exits out of the page
        return () => {
            updateChanges();
        };
    }, []);

    React.useEffect(() => {
        if (!parsed)
            safeFetch(`${constants.proxyUrl}plugins-full.json`, {
                cache: "no-store",
            })
                .then(x =>
                    x
                        .json()
                        .then(x =>
                            // pluh 🗣
                            x.map((plug: any) => ({
                                ...plug,
                                vendetta: {
                                    ...plug.vendetta,
                                    original: properLink(
                                        plug.vendetta.original,
                                    ),
                                },
                            })),
                        )
                        .then(x => {
                            run(x);
                            changes.current = getChanges();
                            setParsed(x);
                        })
                        .catch(() => {
                            showToast(
                                lang.format("toast.data.fail_parse", {}),
                                getAssetIDByName("Small"),
                            );
                        }),
                )
                .catch(() => {
                    showToast(
                        lang.format("toast.data.fail_fetch", {}),
                        getAssetIDByName("Small"),
                    );
                });
    }, [parsed]);

    managePage({
        title: lang.format("plugin.name", {}),
    });

    return (
        <FlashList
            ListHeaderComponent={
                <Search
                    onChangeText={setSearch}
                    filterSetSort={currentSetSort}
                />
            }
            ListFooterComponent={<RN.View style={{ height: 20 }} />}
            ItemSeparatorComponent={() => <RN.View style={{ height: 15 }} />}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            data={sortedData}
            estimatedItemSize={111}
            renderItem={({ item }) => (
                <PluginCard item={item} changes={changes.current} />
            )}
            removeClippedSubviews
            refreshControl={
                <RN.RefreshControl
                    refreshing={parsed === null}
                    /* onRefresh doesn't seem to work with FlashList no matter how hard I try /shrug */
                    onRefresh={() => parsed !== null && setParsed(null)}
                />
            }
        />
    );
};
