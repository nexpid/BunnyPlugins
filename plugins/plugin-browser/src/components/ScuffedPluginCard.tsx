import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { Forms } from "@vendetta/ui/components";

import { SuperAwesomeIcon } from "../../../../stuff/types";

const { FormRow } = Forms;

interface propAction {
  icon: number;
  destructive?: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

interface props {
  headerLabel: JSX.Element | string;
  headerIcon?: number;
  descriptionLabel: string;
  actions?: propAction[];
  loading?: boolean;
}

const styles = stylesheet.createThemedStyleSheet({
  card: {
    backgroundColor: semanticColors.BACKGROUND_SECONDARY,
    borderRadius: 5,
  },
  header: {
    padding: 0,
    backgroundColor: semanticColors.BACKGROUND_TERTIARY,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  actions: { flexDirection: "row-reverse", alignItems: "center" },
});

export default (props: props) => {
  return (
    <RN.View style={[styles.card, { marginBottom: 10 }]}>
      <FormRow
        style={styles.header}
        label={props.headerLabel}
        leading={props.headerIcon && <FormRow.Icon source={props.headerIcon} />}
      />
      <FormRow
        label={props.descriptionLabel}
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
