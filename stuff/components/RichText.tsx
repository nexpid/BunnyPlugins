import { General } from "@vendetta/ui/components";

import Text from "./Text";

const { Text: _Text } = General;

export namespace RichText {
  export function Bold({
    children,
    onPress,
  }: React.PropsWithChildren<{
    onPress?: () => void;
  }>) {
    return (
      <Text variant={"text-md/bold"} onPress={onPress}>
        {children}
      </Text>
    );
  }

  export function Underline({
    children,
    onPress,
  }: React.PropsWithChildren<{
    onPress?: () => void;
  }>) {
    return (
      <_Text style={{ textDecorationLine: "underline" }} onPress={onPress}>
        {children}
      </_Text>
    );
  }
}
