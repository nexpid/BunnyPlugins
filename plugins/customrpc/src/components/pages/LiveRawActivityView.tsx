import { constants, React, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { Forms, General } from "@vendetta/ui/components";

import SimpleText from "$/components/SimpleText";

import { debug, vstorage } from "../..";
import { dispatchActivityIfPossible } from "../../stuff/activity";

const { View, Text } = General;
const { FormSection } = Forms;

export let forceUpdateLiveRawActivityView: () => void;
export const LiveRawActivityView = () => {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  forceUpdateLiveRawActivityView = forceUpdate;

  const styles = stylesheet.createThemedStyleSheet({
    code: {
      fontFamily: constants.Fonts.CODE_SEMIBOLD,
      includeFontPadding: false,
      color: semanticColors.TEXT_NORMAL,
    },
  });

  return (
    <View>
      <FormSection title="Live Raw Activity">
        {debug.lastRawActivity ? (
          <Text style={styles.code}>
            {JSON.stringify(debug.lastRawActivity, undefined, 3)}
          </Text>
        ) : vstorage.settings.display ? (
          <SimpleText variant="text-md/semibold">
            Display activity setting is disabled. You need to actually enable it
            for the raw activity to show up lmao
          </SimpleText>
        ) : (
          <SimpleText
            variant="text-md/semibold"
            onPress={() => dispatchActivityIfPossible()}
          >
            No last raw activity yet. Tap text to force update
          </SimpleText>
        )}
      </FormSection>
      <FormSection title="Info">
        <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
          Last raw activity update:{" "}
          {debug.lastRawActivityTimestamp
            ? new Date(debug.lastRawActivityTimestamp).toLocaleString("en-US")
            : "-"}
        </SimpleText>
      </FormSection>
    </View>
  );
};

export function openLiveRawActivityView(navigation: any) {
  navigation.push("VendettaCustomPage", {
    render: LiveRawActivityView,
    title: "Live RawActivity",
  });
}
