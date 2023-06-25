import { React } from "@vendetta/metro/common";
import { patches } from "../stuff/patcher";
import { after } from "@vendetta/patcher";

export default ({ props }: { props: any }) => {
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    patches.push(after("onChangeText", props, (args) => setText(args[0])));
  }, []);
};
