import { ReactNative as RN } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";

import { SimpleText } from "../../../../stuff/types";

const { View } = General;

export default () => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <RN.ActivityIndicator size="large" style={{ marginBottom: 12 }} />
      <SimpleText variant="text-lg/semibold" color="TEXT_NORMAL" align="center">
        MonetTheme is reapplying...
      </SimpleText>
    </View>
  );
};
