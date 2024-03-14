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

  avoiding using removed/changed button variants is easier than adding some sort of compatibility :3
 */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "primary-overlay"
  | "secondary-overlay"
  | "destructive"
  | "active";

type TextButtonIcon = React.FC<{
  source: import("react-native").ImageSourcePropType;
  variant?: "entity";
}>;

interface ContextMenuItem {
  label: string;
  iconSource?: import("react-native").ImageSourcePropType;
  IconComponent?: React.JSXElementConstructor;
  action: () => void;
}

export type Redesign = {
  Button: React.FC<{
    text: string;
    variant?: ButtonVariant;
    size?: "sm" | "md" | "lg";
    onPress?: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
    onTouchStart?: () => void;
    disabled?: boolean;
    icon?:
      | import("react-native").ImageSourcePropType
      | React.JSXElementConstructor;
    iconPosition?: "start" | "end";
    grow?: boolean;
    loading?: boolean;
    style?: import("react-native").StyleProp<import("react-native").ViewStyle>;
  }> & {
    Icon: TextButtonIcon;
  };

  ContextMenu: React.FC<{
    triggerOnLongPress?: boolean;
    items?: ContextMenuItem[] | ContextMenuItem[][];
    align?: "left" | "below" | "above" | "right";
    title?: string;
    children?: () => React.ReactNode;
    disableGesture?: boolean;
    returnRef?: object;
  }>;

  TextInput: React.FC<{
    size?: "sm" | "md" | "lg";
    label?: string;
    description?: string;
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
    onChange?: (value: string) => void;
  }>;

  Slider: React.FC<{
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
};
