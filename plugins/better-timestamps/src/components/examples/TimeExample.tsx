import { findByProps } from "@vendetta/metro";
import { constants, React, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { SimpleText } from "../../../../../stuff/types";
import { vstorage } from "../..";

export const { parseTimestamp } = findByProps(
  "parseTimestamp",
  "unparseTimestamp",
);

const styles = stylesheet.createThemedStyleSheet({
  code: {
    fontFamily: constants.Fonts.CODE_SEMIBOLD,
    backgroundColor: semanticColors.BACKGROUND_SECONDARY,
  },
  timestamp: {
    backgroundColor: semanticColors.BACKGROUND_MODIFIER_ACCENT,
  },
});

export function TimeExample() {
  const [relativeTime, setRelativeTime] = React.useState(Date.now());

  React.useLayoutEffect(
    () => setRelativeTime(Date.now()),
    [vstorage.time.acceptRelative],
  );

  return (
    <SimpleText
      variant="text-md/semibold"
      color="TEXT_NORMAL"
      liveUpdate={true}
      getChildren={() => {
        const current = new Date();
        const examples = [
          [4],
          [19, 20],
          [4, 18, 2],
          current.getHours() < 12 && [current.getHours()],
          [current.getHours(), current.getMinutes()],
          [current.getHours(), current.getMinutes(), current.getSeconds()],
        ].filter((x) => !!x) as [
          number,
          number | undefined,
          number | undefined,
        ][];
        const slay = [];

        let i = -1;
        for (const [hours, minutes, seconds] of examples) {
          i++;
          const date = new Date();
          date.setHours(hours, minutes ?? 0, seconds ? seconds : 0);

          let form = [
            date.getHours().toString(),
            minutes !== undefined &&
              date.getMinutes().toString().padStart(2, "0"),
            seconds !== undefined &&
              date.getSeconds().toString().padStart(2, "0"),
          ]
            .filter((x) => !!x)
            .join(":");
          if (hours < 12) form += " AM";

          const time = parseTimestamp(
            Math.floor(date.getTime() / 1000).toString(),
            date.getSeconds() === 0 ? "t" : "T",
          );

          slay.push(
            vstorage.time.requireBackticks ? (
              <SimpleText
                variant="text-md/semibold"
                color="TEXT_NORMAL"
                style={styles.code}
              >
                {form}
              </SimpleText>
            ) : (
              form
            ),
          );
          slay.push(" — ");
          slay.push(
            <SimpleText
              variant="text-md/semibold"
              color="TEXT_NORMAL"
              style={styles.timestamp}
              onPress={() =>
                showToast(time.full, getAssetIDByName("ic_information_24px"))
              }
            >
              {time.formatted}
            </SimpleText>,
          );
          if (i !== examples.length - 1) slay.push("\n");
        }

        if (vstorage.time.acceptRelative) {
          slay.push("\n\n");
          const relativeExamples = [
            ["in 20 seconds", 1000 * 20],
            ["8 minutes ago", -(1000 * 60 * 8)],
          ] as [string, number][];

          i = -1;
          for (const [visual, diff] of relativeExamples) {
            const date = relativeTime + diff;

            const time = parseTimestamp(
              Math.floor(date / 1000).toString(),
              "R",
            );

            slay.push(
              vstorage.time.requireBackticks ? (
                <SimpleText
                  variant="text-md/semibold"
                  color="TEXT_NORMAL"
                  style={styles.code}
                >
                  {visual}
                </SimpleText>
              ) : (
                visual
              ),
            );
            slay.push(" — ");
            slay.push(
              <SimpleText
                variant="text-md/semibold"
                color="TEXT_NORMAL"
                style={styles.timestamp}
                onPress={() =>
                  showToast(time.full, getAssetIDByName("ic_information_24px"))
                }
              >
                {time.formatted}
              </SimpleText>,
            );
            if (i !== relativeExamples.length - 1) slay.push("\n");
          }
        }

        return slay;
      }}
    />
  );
}
