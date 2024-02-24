import { React } from "@vendetta/metro/common";
import { showCustomAlert } from "@vendetta/ui/alerts";
import Wheel from "../components/Wheel";

export function runWheel() {
  showCustomAlert(() => React.createElement(Wheel), {});
}
