import { findByStoreName } from "@vendetta/metro";

import { PlusStructure } from "$/typings";

import { ConfigIconpackMode, enabled, InactiveReason, vstorage } from "..";
import patchIcons from "../patches/icons";
import patchMentionLineColors from "../patches/mentionLineColor";
import { IconpackConfig, IconpackData } from "../types";
import { state, updateState } from "./active";
import constants from "./constants";
import getIconpackData from "./iconpackDataGetter";
import { cFetch, customUrl } from "./util";

const UserStore = findByStoreName("UserStore");

export const patches = new Array<() => void>();

export default async function load() {
    // biunny...
    const { bunny } = (window as any);

    patches.forEach(x => { x(); });
    patches.length = 0;

    state.loading = true;
    state.active = false;
    state.iconpack = {
        iconpack: null,
        list: [],
        hashes: {},
    };
    state.patches = [];
    state.inactive = [];
    updateState();

    try {
        state.iconpack = {
            iconpack: null,
            list: await cFetch<IconpackData>(
                constants.iconpacks.list,
                null,
                "json",
            ).then(res => res.list),
            hashes: await cFetch(constants.iconpacks.hashes, null, "json"),
        };
    } catch {
        if (
            !state.iconpack.list.length ||
      !Object.keys(state.iconpack.hashes).length
        ) {
            state.loading = false;
            state.inactive.push(InactiveReason.NoIconpacksList);
            updateState(); return;
        }
    }

    let selectedTheme = Object.values(bunny.managers.themes.themes).find(
        (x: any) => x.selected,
    ) as any;
    if (!selectedTheme && vstorage.iconpack.mode === ConfigIconpackMode.Manual) {
        selectedTheme = {
            data: {
                plus: {
                    version: 0,
                },
            },
        };
    } else if (!selectedTheme) {
        state.loading = false;
        state.inactive.push(InactiveReason.NoTheme);
        updateState(); return;
    }

    const plusData = selectedTheme.data?.plus as PlusStructure;
    if (!plusData) {
        state.loading = false;
        state.inactive.push(InactiveReason.ThemesPlusUnsupported);
        updateState(); return;
    }

    const useIconpack =
    vstorage.iconpack.mode === ConfigIconpackMode.Automatic
        ? plusData.iconpack
        : vstorage.iconpack.mode === ConfigIconpackMode.Manual
            ? vstorage.iconpack.pack
            : undefined;
    const isCustomIconpack = vstorage.iconpack.isCustom;

    const user = UserStore.getCurrentUser();
    state.iconpack.iconpack = isCustomIconpack
        ? {
            id: "custom-iconpack",
            name: "Custom iconpack",
            description: "A custom iconpack, created by you!",
            credits: {
                authors: [
                    {
                        name: user.username,
                        id: user.id,
                    },
                ],
                sources: ["N/A"],
            },
            config: null,
            suffix: vstorage.iconpack.custom.suffix,
            load: customUrl(),
        }
        : state.iconpack.list.find(x => useIconpack === x.id);

    let iconpackConfig: IconpackConfig = {
        biggerStatus: false,
    };
    let tree = [];

    if (!isCustomIconpack && state.iconpack.iconpack) {
    // TODO this should be an actual type
        let dt: Awaited<ReturnType<typeof getIconpackData>>;
        try {
            dt = await getIconpackData(
                state.iconpack.iconpack.id,
                state.iconpack.iconpack.config,
            );
        } catch {
            dt = { config: null, tree: null };
        }

        if (dt.tree === null) {
            state.loading = false;
            if (dt.config === null)
                state.inactive.push(InactiveReason.NoIconpackConfig);
            if (dt.tree === null) state.inactive.push(InactiveReason.NoIconpackFiles);
            updateState(); return;
        }

        tree = dt.tree;
        if (dt.config) iconpackConfig = dt.config;
    } else if (isCustomIconpack) {
        iconpackConfig.biggerStatus = vstorage.iconpack.custom.config.biggerStatus;
    }

    if (!enabled) return;

    state.active = true;
    state.loading = false;

    patchIcons(plusData, tree, iconpackConfig);
    patchMentionLineColors(plusData);

    updateState();
}
