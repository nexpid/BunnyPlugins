import { getAssetByID } from "@vendetta/ui/assets";

import { PlusStructure } from "$/typings";

import resolveColor from "../stuff/resolveColor";
import { addToStyle } from "../stuff/util";

export function getIconTint(
  plus: PlusStructure,
  icon: number,
  customName?: string,
): string | undefined {
  const name = customName ?? getAssetByID(icon)?.name;
  if (!name) return;
  if (!plus.icons[name]) return;

  return resolveColor(plus.icons[name]);
}

export function asIcon<T extends JSX.Element>(
  plus: PlusStructure,
  customName: string,
  img: T,
): T {
  if (typeof img.props.source === "number") {
    const clr = getIconTint(plus, img.props.source, customName);
    if (clr)
      addToStyle(img.props, {
        tintColor: clr,
      });
  }
  img.props.ignore = true;
  return img;
}
