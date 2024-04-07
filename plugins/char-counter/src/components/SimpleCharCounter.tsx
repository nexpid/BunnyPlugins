import { React, stylesheet } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";

import Text from "$/components/Text";
import { Reanimated } from "$/deps";

import { vstorage } from "..";
import getMessageLength, { display, hasSLM } from "../stuff/getMessageLength";
import { lastText } from "../stuff/patcher";

const styles = stylesheet.createThemedStyleSheet({
  container: {
    textAlign: "center",
    paddingBottom: 2,
    paddingRight: 5,
    marginTop: -5,
  },
});

export default function () {
  useProxy(lastText);
  const fade = Reanimated.useSharedValue(0);

  const curLength = lastText.value.length,
    maxLength = getMessageLength();
  const extraMessages = hasSLM() ? Math.floor(curLength / maxLength) : 0;
  const dspLength = curLength - extraMessages * maxLength;

  const shouldAppear = curLength >= vstorage.minChars;
  React.useEffect(() => {
    fade.value = Reanimated.withTiming(shouldAppear ? 1 : 0, { duration: 100 });
  }, [shouldAppear]);

  return (
    <Reanimated.default.View
      style={[
        styles.container,
        { opacity: fade },
        !shouldAppear && { display: "none" },
      ]}
    >
      <Text
        variant="text-xs/semibold"
        color={dspLength <= maxLength ? "TEXT_NORMAL" : "TEXT_DANGER"}
      >
        {display(dspLength)}
      </Text>
    </Reanimated.default.View>
  );
}
