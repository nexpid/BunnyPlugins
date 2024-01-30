type ButtonVariant =
  | "primary"
  | "primary-on-blurple"
  | "primary-alt"
  | "primary-alt-on-blurple"
  | "secondary"
  | "secondary-alt"
  | "secondary-input"
  | "danger"
  | "positive";

type TextButtonIcon = React.FC<{
  source: import("react-native").ImageSourcePropType;
  variant?: "entity";
}>;

export type Redesign = {
  Button: React.FC<{
    variant: ButtonVariant;
    size: "sm" | "md" | "lg";
    onPress?: () => any;
    text: string;
    icon?:
      | import("react-native").ImageSourcePropType
      | React.JSXElementConstructor;
    iconPosition?: "start" | "end";
    style?: import("react-native").StyleProp<import("react-native").ViewStyle>;
    disabled?: boolean;
    loading?: boolean;
  }> & {
    Icon: TextButtonIcon;
  };

  SegmentedControl: React.FC<{
    state: any;
    variant?: any;
    activeIndex: any;
    scrollOverflow: any;
    items: any[];
    pageWidth: number;
    pressedIndex: any;
    setActiveIndex: any;
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
};
