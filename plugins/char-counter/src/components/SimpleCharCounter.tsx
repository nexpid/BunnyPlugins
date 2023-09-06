import { React, stylesheet } from "@vendetta/metro/common";
import { SimpleText } from "../../../../stuff/types";
import getMessageLength, { hasSLM, prettify } from "../stuff/getMessageLength";
import { vstorage } from "..";
import { useProxy } from "@vendetta/storage";
import { lastText } from "../stuff/patcher";
import { FadeView } from "../../../../stuff/animations";

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

  const curLength = lastText.value.length,
    maxLength = getMessageLength();
  const extraMessages = hasSLM() ? Math.floor(curLength / maxLength) : 0;
  const dspLength = curLength - extraMessages * maxLength;

  const shouldAppear = curLength >= (vstorage.minChars ?? 1);

  return (
    <FadeView
      duration={100}
      style={styles.container}
      fade={shouldAppear ? "in" : "out"}
      setDisplay={true}
    >
      <SimpleText
        variant="text-xs/semibold"
        color={dspLength <= maxLength ? "TEXT_NORMAL" : "TEXT_DANGER"}
      >
        {prettify(dspLength)}/{prettify(maxLength)}
      </SimpleText>
    </FadeView>
  );
}
