import { PlusStructure } from "../../../../stuff/typings";
import resolveColor from "../stuff/resolveColor";

export function getUnreadBadgeColor(plus: PlusStructure): string | undefined {
  if (!plus.unreadBadgeColor) return;
  return resolveColor(plus.unreadBadgeColor);
}
