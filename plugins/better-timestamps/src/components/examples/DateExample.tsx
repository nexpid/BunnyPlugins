import { React, constants, stylesheet } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { vstorage } from "../..";
import { SimpleText } from "../../../../../stuff/types";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

export const { parseTimestamp } = findByProps(
  "parseTimestamp",
  "unparseTimestamp"
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

export function DateExample() {
  const [relativeTime, setRelativeTime] = React.useState(Date.now());

  React.useLayoutEffect(
    () => setRelativeTime(Date.now()),
    [vstorage.day.acceptRelative]
  );

  return (
    <SimpleText
      variant="text-md/semibold"
      color="TEXT_NORMAL"
      liveUpdate={true}
      getChildren={() => {
        const current = new Date();
        const examples = [
          [21, 11, 2023],
          [12, 5],
          [1, 8, 20],
          [current.getDate(), current.getMonth() - 1, current.getFullYear()],
          [current.getDate(), current.getMonth() - 1],
          [
            current.getDate(),
            current.getMonth() - 1,
            current.getFullYear() - 2000,
          ],
        ].filter((x) => !!x) as [number, number, number | undefined][];
        const slay = [];

        let i = -1;
        for (let [day, month, year] of examples) {
          i++;
          const curY = new Date().getFullYear();
          const date = new Date();

          if (year < 100) year += 2000;

          date.setFullYear(year ?? curY, month, day);

          const time = parseTimestamp(
            Math.floor(date.getTime() / 1000).toString(),
            "d"
          );

          const form = [
            vstorage.day.american ? month : day,
            vstorage.day.american ? day : month,
            year,
          ].join("/");
          slay.push(
            vstorage.day.requireBackticks ? (
              <SimpleText
                variant="text-md/semibold"
                color="TEXT_NORMAL"
                style={styles.code}
              >
                {form}
              </SimpleText>
            ) : (
              form
            )
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
            </SimpleText>
          );
          if (i !== examples.length - 1) slay.push("\n");
        }

        if (vstorage.day.acceptRelative) {
          slay.push("\n\n");
          const day = 1000 * 60 * 60 * 24;
          const year = day * (365 + 1 / 4);
          const relativeExamples = [
            ["yesterday", -day],
            ["in 2 days", day * 2],
            ["2 centuries ago", -(year * 200)],
            ["next week", day * 7],
          ] as [string, number][];

          i = -1;
          for (const [visual, diff] of relativeExamples) {
            const date = relativeTime + diff;

            const time = parseTimestamp(
              Math.floor(date / 1000).toString(),
              "R"
            );

            slay.push(
              vstorage.day.requireBackticks ? (
                <SimpleText
                  variant="text-md/semibold"
                  color="TEXT_NORMAL"
                  style={styles.code}
                >
                  {visual}
                </SimpleText>
              ) : (
                visual
              )
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
              </SimpleText>
            );
            if (i !== relativeExamples.length - 1) slay.push("\n");
          }
        }

        return slay;
      }}
    />
  );
}
