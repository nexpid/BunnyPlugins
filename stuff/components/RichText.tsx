import { General } from "@vendetta/ui/components";

import SimpleText from "./SimpleText";

const { Text } = General;

export namespace RichText {
  export function Bold({
    children,
    onPress,
  }: React.PropsWithChildren<{
    onPress?: () => void;
  }>) {
    return (
      <SimpleText variant={"text-md/bold"} onPress={onPress}>
        {children}
      </SimpleText>
    );
  }

  export function Underline({
    children,
    onPress,
  }: React.PropsWithChildren<{
    onPress?: () => void;
  }>) {
    return (
      <Text style={{ textDecorationLine: "underline" }} onPress={onPress}>
        {children}
      </Text>
    );
  }
}
