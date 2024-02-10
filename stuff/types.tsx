import { constants, logger } from "@vendetta";
import {
  find,
  findByName,
  findByProps,
  findByStoreName,
} from "@vendetta/metro";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import Modal from "./components/Modal";
import type { Redesign as _Redesign } from "./redesign";

const ThemeStore = findByStoreName("ThemeStore");
const { triggerHaptic } = findByProps("triggerHaptic");

const colorModule = findByProps("colors", "unsafe_rawColors");
const colorResolver = colorModule?.internal ?? colorModule?.meta;

export const TextStyleSheet = findByProps("TextStyleSheet")
  .TextStyleSheet as _TextStyleSheet;

export const ActionSheet =
  findByProps("ActionSheet")?.ActionSheet ??
  find((x) => x.render?.name === "ActionSheet"); // thank you to @pylixonly for fixing this

export const LazyActionSheet = findByProps("openLazy", "hideActionSheet");
export const { openLazy, hideActionSheet } = LazyActionSheet;

export const {
  ActionSheetTitleHeader,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
} = findByProps(
  "ActionSheetTitleHeader",
  "ActionSheetCloseButton",
  "ActionSheetContentContainer",
);
export const ActionSheetRow = findByProps("ActionSheetRow")?.ActionSheetRow;

export const Navigator =
  findByName("Navigator") ?? findByProps("Navigator")?.Navigator;
export const modalCloseButton =
  findByProps("getRenderCloseButton")?.getRenderCloseButton ??
  findByProps("getHeaderCloseButton")?.getHeaderCloseButton;
export const { popModal, pushModal } = findByProps("popModal", "pushModal");

export const Redesign = (findByProps("Button", "ContextMenu", "TextInput") ??
  {}) as _Redesign;

export type Entries<T> = [keyof T, T[keyof T]];

// ...

export function resolveSemanticColor(
  color: any,
  theme: string = ThemeStore.theme,
) {
  return colorResolver.resolveSemanticColor(theme, color);
}

export function getUserAvatar(
  user: {
    discriminator: string;
    avatar?: string;
    id: string;
  },
  animated?: boolean,
): string {
  const isPomelo = user.discriminator === "0";

  return user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${
        animated && user.avatar.startsWith("a_")
          ? `${user.avatar}.gif`
          : `${user.avatar}.png`
      }`
    : `https://cdn.discordapp.com/embed/avatars/${
        isPomelo
          ? (parseInt(user.id) >> 22) % 6
          : parseInt(user.discriminator) % 5
      }`;
}

export function openSheet<T extends React.FunctionComponent>(
  sheet: T,
  props: Parameters<T>[0],
) {
  try {
    openLazy(
      new Promise((x) =>
        x({
          default: sheet,
        }),
      ),
      "ActionSheet",
      props,
    );
  } catch (e) {
    logger.error(e.stack);
    showToast(
      "Got error when opening ActionSheet! Please check debug logs",
      getAssetIDByName("Smal"),
    );
  }
}

export function openModal(key: string, modal: typeof Modal) {
  const empty = Symbol("empty");
  if (!Navigator || !modalCloseButton)
    return showToast(
      `${[
        Navigator ? empty : "Navigator",
        modalCloseButton ? empty : "modalCloseButton",
      ]
        .filter((x) => x !== empty)
        .join(", ")} is missing! Please try reinstalling your client.`,
      getAssetIDByName("Small"),
    );

  pushModal({
    key,
    modal: {
      key,
      modal,
      animation: "slide-up",
      shouldPersistUnderModals: false,
      closable: true,
    },
  });
}

export function doHaptic(dur: number): Promise<void> {
  triggerHaptic();
  const interval = setInterval(triggerHaptic, 1);
  return new Promise((res) =>
    setTimeout(() => res(clearInterval(interval)), dur),
  );
}

export function getClient() {
  const gh = constants.GITHUB;
  if (gh.includes("vendetta-mod")) return "Vendetta";
  else if (gh.includes("revenge-mod")) return "Revenge";
  else return "Enmity"; // troll
}

// ...

type TextStyleSheetCase =
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";
type TextStyleSheetRedesignCase = "normal" | "medium" | "semibold" | "bold";

export type TextStyleSheetVariant =
  | `heading-sm/${TextStyleSheetCase}`
  | `heading-md/${TextStyleSheetCase}`
  | `heading-lg/${TextStyleSheetCase}`
  | `heading-xl/${TextStyleSheetCase}`
  | `heading-xxl/${TextStyleSheetCase}`
  | "eyebrow"
  | "redesign/heading-18/bold"
  | `text-xxs/${TextStyleSheetCase}`
  | `text-xs/${TextStyleSheetCase}`
  | `text-sm/${TextStyleSheetCase}`
  | `text-md/${TextStyleSheetCase}`
  | `text-lg/${TextStyleSheetCase}`
  | `redesign/message-preview/${TextStyleSheetRedesignCase}`
  | `redesign/channel-title/${TextStyleSheetRedesignCase}`
  | "display-sm"
  | "display-md"
  | "display-lg";
// ignoring deprecated styles

type _TextStyleSheet = Record<
  TextStyleSheetVariant,
  {
    fontSize: number;
    lineHeight: number;
    textTransform: "none" | "capitalize" | "uppercase" | "lowercase";
    fontFamily: string;
    includeFontPadding: boolean;
    letterSpacing?: number;
  }
>;

export interface SearchContext {
  type: string;
  [key: PropertyKey]: any;
}

export function isObject(x: Record<any, any>) {
  return typeof x === "object" && !Array.isArray(x);
}
