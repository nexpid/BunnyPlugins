import { ESCAPE_REGEX } from "@vendetta/constants";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { rawColors, semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

import CustomBadgeTag from "$/components/CustomBadgeTag";
import SuperAwesomeIcon from "$/components/SuperAwesomeIcon";
import { TextStyleSheet } from "$/types";

const { FormRow } = Forms;

interface propAction {
  icon: number;
  destructive?: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

interface props {
  index: number;
  update?: string;
  headerLabel: string;
  headerSublabel: JSX.Element | string;
  headerIcon?: string;
  descriptionLabel: string;
  actions?: propAction[];
  loading?: boolean;
  highlight: string;
}

const styles = stylesheet.createThemedStyleSheet({
  card: {
    backgroundColor: semanticColors?.BACKGROUND_SECONDARY,
    borderRadius: 12,
  },
  header: {
    padding: 0,
    backgroundColor: semanticColors?.BACKGROUND_TERTIARY,
    borderRadius: 12,
  },
  headerChildren: {
    flexDirection: "column",
    justifyContent: "center",
  },
  headerLabelStuff: {
    flexDirection: "row",
  },
  headerLabel: {
    color: semanticColors?.TEXT_NORMAL,
    ...TextStyleSheet["text-md/semibold"],
  },
  headerSubtitle: {
    color: semanticColors?.TEXT_MUTED,
    ...TextStyleSheet["text-sm/semibold"],
  },
  actions: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  icon: {
    width: 22,
    height: 22,
    marginLeft: 5,
    tintColor: semanticColors?.INTERACTIVE_NORMAL,
  },
  iconContainer: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: semanticColors?.BACKGROUND_ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  smallerIcon: {
    width: 22,
    height: 22,
    tintColor: semanticColors?.INTERACTIVE_NORMAL,
  },
  highlight: {
    backgroundColor: "#F0" + rawColors.YELLOW_300.slice(1),
  },
});

const highlighter = (str: string, highlight: string) => {
  if (!highlight) return str;

  return str
    .split(
      new RegExp("(" + highlight.replace(ESCAPE_REGEX, "\\$&") + ")", "gi"),
    )
    .map((x, i) =>
      i % 2 === 1 ? <RN.Text style={styles.highlight}>{x}</RN.Text> : x,
    );
};

export default (props: props) => {
  return (
    <RN.View style={[styles.card, { marginTop: props.index !== 0 ? 10 : 0 }]}>
      <FormRow
        style={styles.header}
        label={
          <RN.View style={styles.headerChildren}>
            <RN.View style={styles.headerLabelStuff}>
              {props.update && <CustomBadgeTag text={props.update} />}
              <RN.Text style={styles.headerLabel}>
                {highlighter(props.headerLabel, props.highlight)}
              </RN.Text>
            </RN.View>

            {props.headerSublabel && (
              <RN.Text style={styles.headerSubtitle}>
                {props.headerSublabel}
              </RN.Text>
            )}
          </RN.View>
        }
        leading={
          props.headerIcon && (
            <RN.View style={styles.iconContainer}>
              <RN.Image
                source={getAssetIDByName(props.headerIcon)}
                style={styles.smallerIcon}
              />
            </RN.View>
          )
        }
      />
      <FormRow
        label={
          props.descriptionLabel &&
          highlighter(props.descriptionLabel, props.highlight)
        }
        trailing={
          <RN.View style={styles.actions}>
            {props.actions?.map(
              ({ icon, onPress, onLongPress, destructive }) => (
                <SuperAwesomeIcon
                  icon={icon}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style="card"
                  destructive={destructive ?? false}
                />
              ),
            )}
            {props.loading && (
              <RN.ActivityIndicator
                size="small"
                style={{
                  height: 22,
                  width: 22,
                }}
              />
            )}
          </RN.View>
        }
      />
    </RN.View>
  );
};
