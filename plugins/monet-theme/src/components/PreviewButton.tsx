import { React } from "@vendetta/metro/common";
import { rawColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

import SuperAwesomeIcon from "$/components/SuperAwesomeIcon";

import { enabled, toggle } from "../stuff/livePreview";

export default ({ onPressExtra }: { onPressExtra: () => void }) => {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);

  return (
    <SuperAwesomeIcon
      style="header"
      color={enabled && rawColors.BRAND_500}
      icon={getAssetIDByName("SparklesIcon")}
      onPress={() => {
        toggle(!enabled);
        forceUpdate();
        onPressExtra();
      }}
    />
  );
};
