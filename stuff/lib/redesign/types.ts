import {
  type ImageSourcePropType,
  type PressableProps,
  type View,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { type SharedValue } from "react-native-reanimated";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "primary-overlay"
  | "secondary-overlay"
  | "destructive"
  | "active"
  /** @deprecated use destructive */
  | "danger"
  /** @deprecated use active */
  | "positive";

export interface PrimitiveButton {
  onPress?: () => void;
  disabled?: boolean;
  icon?: ImageSourcePropType | React.ReactNode;
  style?: ViewStyle;
}
export interface PrimitiveButtonIcon {
  source: ImageSourcePropType;
}

export type Button = React.FC<
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

export type RowButton = React.FC<
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

export type FAB = React.FC<{
  icon: ImageSourcePropType;
  onPress?: () => void;
  text?: string;
  positionBottom?: number;
  state?: {
    collapseText?: SharedValue;
  };
}>;

export type IconButton = React.FC<{
  icon: ImageSourcePropType | React.ReactNode;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: ButtonVariant;
  style?: ViewStyle;
}>;

export type Slider = React.FC<{
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

export type TextInput = React.FC<{
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
  leadingPressableProps?: PressableProps;
  leadingIcon?: React.FC;
  leadingText?: string;
  trailingPressableProps?: PressableProps;
  trailingIcon?: React.FC;
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
export type Tabs = React.FC<{
  state: controlState;
}>;

export type Card = View;

export type Stack = React.FC<
  React.PropsWithChildren<
    ViewProps & {
      direction?: "horizontal" | "vertical";
      spacing?: number;
    }
  >
>;

export type useSegmentedControlState = (state: {
  defaultIndex: number;
  items: {
    label: string;
    id: string;
    page: React.ReactNode;
  }[];
  pageWidth: number;
}) => controlState;
