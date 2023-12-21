import { ReactNative } from "@vendetta/metro/common";

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

export type Button = React.FC<{
  variant: ButtonVariant;
  size: "sm" | "md" | "lg";
  onPress?: () => any;
  text: string;
  icon?: import("react-native").ImageSourcePropType;
  iconPosition?: "start" | "end";
  style?: import("react-native").StyleProp<import("react-native").ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
}>;

export type Redesign = {
  Button: Button;
};
