import patcher from "./stuff/patcher";

let unpatch: () => void;

export const onLoad = () => (unpatch = patcher());
export const onUnload = () => unpatch?.();
