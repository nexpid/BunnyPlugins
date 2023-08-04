import { getAssetByID } from "@vendetta/ui/assets";
import { addToStyle } from "../stuff/util";
import { PlusStructure } from "../../../../stuff/typings";
import resolveColor from "../stuff/resolveColor";

export function getIconTint(
  plus: PlusStructure,
  icon: number,
  customName?: string
): string | undefined {
  const name = customName ?? getAssetByID(icon)?.name;
  if (!name) return;
  if (!plus.icons[name]) return;

  return resolveColor(plus.icons[name]);
}

export function asIcon<T extends JSX.Element>(
  plus: PlusStructure,
  customName: string,
  img: T
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
