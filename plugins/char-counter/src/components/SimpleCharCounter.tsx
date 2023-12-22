import { React, stylesheet } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";

import { FadeView } from "../../../../stuff/animations";
import { SimpleText } from "../../../../stuff/types";
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
        {display(dspLength)}
      </SimpleText>
    </FadeView>
  );
}
