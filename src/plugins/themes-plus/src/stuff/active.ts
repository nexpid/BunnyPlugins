import { React } from "@vendetta/metro/common";

import { InactiveReason, PatchType } from "..";
import { Iconpack, IconpackData } from "../types";

export const state = {
    loading: true,
    active: false,
    iconpack: {
        iconpack: null as Iconpack | null,
        list: [] as IconpackData["list"],
        hashes: {} as Record<string, { hash: string; size: number }>,
    },
    patches: [] as PatchType[],
    inactive: [] as InactiveReason[],
};

let stateUsers = new Array<() => void>();
export function useState() {
    const [_, forceUpdate] = React.useReducer(x => ~x, 0);

    React.useEffect(() => {
        const func = () => {
            forceUpdate();
        };

        stateUsers.push(func);
        return () => {
            stateUsers = stateUsers.filter(x => x !== func);
        };
    }, []);
}
export function updateState() {
    stateUsers.forEach(x => {
        x();
    });
}
