import { React, ReactNative, constants } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { stylesheet } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { Colors, ThemeStore, parseTimestamp } from ".";
import { semanticColors } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import { BetterTableRowGroup } from "../../../stuff/types";

export const vstorage: Record<
  "reqBackticks" | "reqMinutes" | "alwaysLong",
  boolean | undefined
> = storage;

const { ScrollView, Text } = General;
const { FormSwitchRow, FormIcon } = Forms;

export function TimeExample({ style }: { style: any }): React.JSX.Element {
  const [refVal, setRefVal] = React.useState(false);

  const nextSecond = new Date();
  nextSecond.setSeconds(nextSecond.getSeconds() + 1, 0);
  setTimeout(() => setRefVal(!refVal), nextSecond.getTime() - Date.now());

  const current = new Date();
  const examples = [
    [4],
    [19, 20],
    [4, 18, 2],
    current.getHours() < 12 && [current.getHours()],
    [current.getHours(), current.getMinutes()],
    [current.getHours(), current.getMinutes(), current.getSeconds()],
  ].filter((x) => !!x) as [number, number | undefined, number | undefined][];
  const slay = [];

  let i = -1;
  for (const [hours, minutes, seconds] of examples) {
    i++;
    const date = new Date();
    date.setHours(hours, minutes ?? 0, seconds ? seconds : 0);

    let form = [
      date.getHours().toString(),
      minutes !== undefined && date.getMinutes().toString().padStart(2, "0"),
      seconds !== undefined && date.getSeconds().toString().padStart(2, "0"),
    ]
      .filter((x) => !!x)
      .join(":");
    if (hours < 12) form += " AM";

    const time = parseTimestamp(
      Math.floor(date.getTime() / 1000).toString(),
      vstorage.alwaysLong ? "T" : "t"
    );

    slay.push(
      vstorage.reqBackticks ? <Text style={style.code}>{form}</Text> : form
    );
    slay.push(" — ");
    slay.push(
      <Text
        style={style.timestamp}
        onPress={() =>
          showToast(time.full, getAssetIDByName("ic_information_24px"))
        }
      >
        {time.formatted}
      </Text>
    );
    if (i !== examples.length - 1) slay.push("\n");
  }

  return <>{...slay}</>;
}

export default () => {
  vstorage.reqBackticks ??= true;
  vstorage.alwaysLong ??= false;
  useProxy(vstorage);

  const theme = ThemeStore.theme;
  const color = Colors.meta.resolveSemanticColor(
    theme,
    semanticColors.TEXT_NORMAL
  );
  const spoilerHidden = Colors.meta.resolveSemanticColor(
    theme,
    semanticColors.SPOILER_HIDDEN_BACKGROUND
  );
  const spoilerRevealed = Colors.meta.resolveSemanticColor(
    theme,
    semanticColors.BACKGROUND_MODIFIER_ACCENT
  );

  const style = stylesheet.createThemedStyleSheet({
    mainText: {
      fontFamily: constants.Fonts.DISPLAY_NORMAL,
      includeFontPadding: false,
      fontSize: 16,
      color,
    },
    boldText: {
      fontFamily: constants.Fonts.DISPLAY_BOLD,
      includeFontPadding: false,
      color,
    },
    code: {
      fontFamily: constants.Fonts.CODE_SEMIBOLD,
      includeFontPadding: false,
      color,
      backgroundColor: spoilerHidden,
    },
    timestamp: {
      fontFamily: constants.Fonts.DISPLAY_NORMAL,
      includeFontPadding: false,
      color,
      backgroundColor: spoilerRevealed,
    },
  });

  return (
    <ScrollView>
      <BetterTableRowGroup
        title="Info"
        icon={getAssetIDByName("ic_info_24px")}
        padding={true}
      >
        <Text style={style.mainText}>
          Send a message with a time code (in
          {<Text style={style.boldText}> HH:MM</Text>} or
          {<Text style={style.boldText}> HH:MM:SS</Text>} format) and
          automatically turn it into a timestamp{"\n\n"}
          <TimeExample style={style} />
        </Text>
      </BetterTableRowGroup>
      <BetterTableRowGroup title="Settings" icon={getAssetIDByName("settings")}>
        <FormSwitchRow
          label="Require Backticks"
          subLabel="Require time to be surrounded by backticks"
          leading={<FormIcon source={getAssetIDByName("ic_message_edit")} />}
          onValueChange={() => (vstorage.reqBackticks = !vstorage.reqBackticks)}
          value={vstorage.reqBackticks}
        />
        <FormSwitchRow
          label="Always Long Time"
          subLabel={...[
            "Always display ",
            <Text style={style.boldText}>HH:MM:SS</Text>,
            " instead of ",
            <Text style={style.boldText}>HH:MM</Text>,
          ]}
          leading={<FormIcon source={getAssetIDByName("ic_message_edit")} />}
          onValueChange={() => (vstorage.alwaysLong = !vstorage.alwaysLong)}
          value={vstorage.alwaysLong}
        />
      </BetterTableRowGroup>
    </ScrollView>
  );
};
