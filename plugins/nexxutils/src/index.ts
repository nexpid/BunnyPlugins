import { makeStorage } from "$/storage";

import settings from "./components/Settings";
import modules from "./modules";
import devtools from "./stuff/devtools";

export const vstorage = makeStorage({
  modules: {} as Record<
    string,
    {
      enabled: boolean;
      options: Record<string, any>;
    }
  >,
});

export const version = "0.3.0";

let undevtool: () => void;

export default {
  onLoad: () => (
    modules.forEach((x) => x.storage.enabled && x.start()),
    (undevtool = devtools())
  ),
  onUnload: () => (
    modules.forEach((x) => x.storage.enabled && x.stop()), undevtool?.()
  ),
  settings,
};
