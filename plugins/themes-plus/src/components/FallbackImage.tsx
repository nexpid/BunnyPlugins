import { ReactNative as RN, React } from "@vendetta/metro/common";

type ImageSource = number | { uri: string };
interface Props {
  image: ImageSource;
  fallback: ImageSource;
  style?: any;
  ignore?: boolean;
}

export default function (props: Props) {
  const [errored, setErrored] = React.useState(false);
  return (
    <RN.Image
      source={errored ? props.fallback : props.image}
      style={props.style}
      onError={() => setErrored(true)}
      //@ts-ignore ignore is a madeup prop
      ignore={props.ignore}
    />
  );
}
