import { findByProps } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";

import CompatSlider from "$/components/compat/CompatSlider";

const OhFuck = (prop: string) => () => {
  React.useEffect(() => {
    showToast("Uh oh, something broke! Search for fckp in Debug Logs!");
    console.warn(
      `Uh oh (fckp)!!\nMissing the redesign component: ${prop}. Please bug @nexpid about this on Discord!`,
    );
  }, []);
  return null;
};
const OhFuckFunction = (prop: string) => () => {
  showToast("Uh oh, something broke! Search for fckp in Debug Logs!");
  console.warn(
    `Uh oh (fckp)!!\nMissing the redesign function: ${prop}. Please bug @nexpid about this on Discord!`,
  );
  return null;
};

const findThing = (...props: string[]) => findByProps(...props)?.[props[0]];
const findThingRequired = (...props: string[]) =>
  findThing(...props) ?? OhFuck(props[0]);
const findFuncRequired = (...props: string[]) =>
  findThing(...props) ?? OhFuckFunction(props[0]);

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

// STUB button variant polyfill
export function buttonVariantPolyfill() {
  if ("REDESIGN_BUTTON_ACTIVE_TEXT" in semanticColors)
    return {
      active: "active",
      destructive: "destructive",
    };
  else
    return {
      active: "positive",
      destructive: "danger",
    };
}

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "primary-overlay"
  | "secondary-overlay"
  | "destructive"
  | "active";

type PrimitiveButton = {
  onPress?: () => void;
  disabled?: boolean;
  icon?: import("react-native").ImageSourcePropType | React.ReactNode;
  style?: import("react-native").StyleProp<import("react-native").ViewStyle>;
};
type PrimitiveButtonIcon = {
  source: import("react-native").ImageSourcePropType;
};

export const Button = findThingRequired("Button") as React.FC<
  PrimitiveButton & {
    variant?: ButtonVariant;
    size?: "sm" | "md" | "lg";
    text: string;
    iconPosition?: "start" | "end";
    grow?: boolean;
    loading?: boolean;
    onPressIn?: () => void;
    onPressOut?: () => void;
  }
> & {
  Icon: React.FC<PrimitiveButtonIcon>;
};

export const RowButton = findThingRequired("RowButton") as React.FC<
  PrimitiveButton & {
    label: string;
    subLabel?: string;
    variant?: "primary" | "secondary";
    trailing?: React.ReactNode;
    draggable?: boolean;
    arrow?: boolean;
    /** Requires onPress to bet set */
    onPressIn?: () => void;
    /** Requires onPress to bet set */
    onPressOut?: () => void;
  }
> & {
  Icon: React.FC<
    PrimitiveButtonIcon & {
      variant?: "secondary" | "danger" | "blurple" | "boosting-pink";
    }
  >;
};

const _Slider = findThing("Slider");
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

// STUB compat slider
export const Slider = (_Slider ? BetterSlider : CompatSlider) as React.FC<{
  value: number;
  accessibilityLabel?: string;
  accessibilityValue?: {
    text: string;
  };
  step: number;
  onValueChange?: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}>;

export const FloatingActionButton = findThingRequired(
  "FloatingActionButton",
) as React.FC<{
  icon: import("react-native").ImageSourcePropType;
  onPress?: () => void;
  text?: string;
  positionBottom?: number;
  state?: {
    collapseText?: import("react-native-reanimated").SharedValue;
  };
}>;

export const TextInput = findThingRequired("TextInput") as React.FC<{
  size?: "sm" | "md" | "lg";
  label?: string;
  description?: React.ReactNode;
  editable?: boolean;
  focusable?: boolean;
  placeholder?: string;
  placeholderTextColor?: string;
  defaultValue?: string;
  value?: string;
  isDisabled?: boolean;
  leadingPressableProps?: import("react-native").PressableProps;
  leadingIcon?: React.FC<any>;
  leadingText?: string;
  trailingPressableProps?: import("react-native").PressableProps;
  trailingIcon?: React.FC<any>;
  trailingText?: string;
  secureTextEntry?: boolean;
  isClearable?: boolean;
  status?: "error" | "default";
  errorMessage?: string;
  spellCheck?: boolean;
  isCentered?: boolean;
  returnKeyType?: "search";
  grow?: boolean;
  autoCapitalize?: string;
  autoCorrect?: boolean;
  isRound?: boolean;
  onChange?: (value: string) => void;
}>;

type controlState = symbol;

export const Tabs = findThingRequired("Tabs") as React.FC<{
  state: controlState;
}>;
export const SegmentedControlPages = findThingRequired(
  "SegmentedControlPages",
) as React.FC<{
  state: controlState;
}>;

export const useSegmentedControlState = findFuncRequired(
  "useSegmentedControlState",
) as (state: {
  defaultIndex: number;
  items: {
    label: string;
    id: string;
    page: React.ReactNode;
  }[];
  pageWidth: number;
}) => controlState;
