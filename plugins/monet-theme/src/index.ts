import { storage } from "@vendetta/plugin";
import settings from "./components/Settings";

export const vstorage: {
  colors?: {
    neutral1: string;
    neutral2: string;
    accent1: string;
    accent2: string;
    accent3: string;
  };
} = storage;

export const patchesURL =
  "https://raw.githubusercontent.com/Gabe616/VendettaMonetTheme/master/patches.jsonc";
export const commitsURL =
  "https://api.github.com/repos/Gabe616/VendettaMonetTheme/commits?path=patches.jsonc";

export default {
  settings,
};
