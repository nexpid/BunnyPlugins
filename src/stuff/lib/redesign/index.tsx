import { findByProps } from "@vendetta/metro";
import { React, ReactNative, ReactNative as RN } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";

import CompatSlider from "$/components/compat/CompatSlider";

import * as t from "./types"; // shamelessly stolen from Bunny

const NotFound = (prop: string, isFunction?: boolean) => () => {
    React.useEffect(() => {
        showToast(`${prop} not found! Search for PNF in Debug Logs!`);
        console.warn(
            `!! PNF ERROR !!\nMissing the redesign ${isFunction ? "function" : "component"}: ${prop}. Please bug @nexpid about this on Discord!`,
        );
    }, []);
    return null;
};

const findProp = (...props: string[]) => findByProps(...props)[props[0]];
const findPropPolyfill = (isFunction: boolean, ...props: string[]) =>
    findProp(...props) ?? NotFound(props[0], isFunction);

/*
  button variant update around version 222.4:
  removed:
    - primary-on-blurple
    - primary-alt
    - primary-alt-on-blurple
    - secondary-alt
    - secondary-input
  changed:
    - danger > destructive
    - positive > active
*/

// STUB[epic=plugin] button variant polyfill
export function buttonVariantPolyfill() {
    if ("REDESIGN_BUTTON_ACTIVE_TEXT" in semanticColors)
        return {
            active: "active",
            destructive: "destructive",
        } as const;
    else
        return {
            active: "positive",
            destructive: "danger",
        } as const;
}

// STUB[epic=plugin] compat pressable scale
const _PressableScale = findProp("PressableScale");

// STUB[epic=plugin] compat slider
const _Slider = findProp("Slider");

const BetterSlider = (props: any) => (
    <RN.View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 12 }}>
        <_Slider
            {...props}
            onValueChange={(val: any) =>
                props.value !== val && props.onValueChange?.(val)
            }
        />
    </RN.View>
);

// components

// buttons
export const Button = findPropPolyfill(false, "Button") as t.Button;
export const RowButton = findPropPolyfill(false, "RowButton") as t.RowButton;
export const FloatingActionButton = findPropPolyfill(
    false,
    "FloatingActionButton",
) as t.FAB;
export const PressableScale = (_PressableScale ??
  ReactNative.Pressable) as typeof ReactNative.Pressable;
export const IconButton = findPropPolyfill(false, "IconButton") as t.IconButton;

// inputs
export const Slider = (_Slider ? BetterSlider : CompatSlider) as t.Slider;
export const TextInput = findPropPolyfill(false, "TextInput") as t.TextInput;

// tabs
export const Tabs = findPropPolyfill(false, "Tabs") as t.Tabs;
export const SegmentedControlPages = findPropPolyfill(
    false,
    "SegmentedControlPages",
) as t.Tabs;

// views
export const Card = findPropPolyfill(false, "Card") as t.Card;
export const Stack = findPropPolyfill(false, "Stack") as t.Stack;

// functions

export const useSegmentedControlState = findPropPolyfill(
    true,
    "useSegmentedControlState",
) as t.useSegmentedControlState;

// misc

export const hasPressableScale = _PressableScale !== undefined;
