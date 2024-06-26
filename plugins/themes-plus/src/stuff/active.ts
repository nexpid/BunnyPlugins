import { React } from "@vendetta/metro/common";

import { InactiveReason, PatchType } from "..";
import { IconPack, IconPackData } from "../types";

export const state = {
  loading: true,
  active: false,
  iconpack: null as {
    iconpack: IconPack | null;
    list: IconPackData["list"];
  },
  patches: [] as PatchType[],
  inactive: [] as InactiveReason[],
};

let stateUsers = new Array<() => void>();
export function useState() {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);

  React.useEffect(() => {
    const func = () => forceUpdate();

    stateUsers.push(func);
    return () => {
      stateUsers = stateUsers.filter((x) => x !== func);
    };
  }, []);
}
export function updateState() {
  stateUsers.forEach((x) => x());
}
