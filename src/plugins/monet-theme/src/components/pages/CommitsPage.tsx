import { ReactNative as RN } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";

import { FlashList } from "$/deps";
import { IconButton } from "$/lib/redesign";
import { managePage } from "$/lib/ui";

import { vstorage } from "../..";
import Commit, { CommitState } from "../Commit";
import useCommits from "../hooks/useCommits";

export default function CommitsPage() {
    useProxy(vstorage);
    const { commits } = useCommits();

    managePage(
        {
            title: "Commits",
            headerRight: () => (
                <IconButton
                    icon={getAssetIDByName("ArrowAngleLeftUpIcon")}
                    size="sm"
                    variant="secondary"
                    disabled={!vstorage.patches.commit}
                    onPress={() => delete vstorage.patches.commit}
                />
            ),
        },
        null,
        vstorage.patches.commit,
    );

    return (
        <FlashList
            ItemSeparatorComponent={() => <RN.View style={{ height: 12 }} />}
            ListFooterComponent={<RN.View style={{ height: 20 }} />}
            estimatedItemSize={131}
            data={commits ?? []}
            extraData={vstorage.patches.commit}
            keyExtractor={item => item.sha}
            renderItem={({ item, index }) => (
                <Commit
                    commit={item}
                    onPress={() => (vstorage.patches.commit = item.sha)}
                    state={
                        vstorage.patches.commit === item.sha
                            ? CommitState.Selected
                            : index === 0 && !vstorage.patches.commit
                              ? CommitState.Default
                              : undefined
                    }
                />
            )}
            removeClippedSubviews
        />
    );
}
