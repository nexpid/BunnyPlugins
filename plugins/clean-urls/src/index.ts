import constants from "$/constants";

import patcher from "./stuff/patcher";

export const listUrl = `${constants.github.raw}plugins/clean-urls/assets/list.json`;

let unpatch: () => void;

export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
};
