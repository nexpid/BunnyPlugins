import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { SuperAwesomeIcon } from "../../../../stuff/types";
import { enabled, toggle } from "../stuff/livePreview";
import { rawColors } from "@vendetta/ui";

export default () => {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);

  return (
    <SuperAwesomeIcon
      style="header"
      color={enabled && rawColors.BRAND_500}
      icon={getAssetIDByName("ic_eye")}
      onPress={() => {
        toggle(!enabled);
        forceUpdate();
      }}
    />
  );
};
