import { React } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";

const { View } = General;

export default function (): React.JSX.Element {
  const [state, setState] = React.useState(0);

  return (
    <View
      style={{
        flex: 1,
        width: "80%",
        aspectRatio: 1,
        backgroundColor: "#151515",
        borderRadius: 2147483647,
      }}
    ></View>
  );
}
