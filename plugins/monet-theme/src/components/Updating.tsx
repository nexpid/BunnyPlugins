import { ReactNative as RN } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";

import SimpleText from "$/components/SimpleText";

const { View } = General;

export default () => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <RN.ActivityIndicator
        size="large"
        style={{ marginBottom: 12 }}
        color="#fff"
      />
      <SimpleText
        variant="text-lg/semibold"
        align="center"
        style={{ color: "#fff" }}
      >
        MonetTheme is reapplying...
      </SimpleText>
    </View>
  );
};
