import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { resolveCustomSemantic } from "../../../../stuff/colors";
import { rawColors } from "@vendetta/ui";
import { SimpleText } from "../../../../../../../stuff/types";
import { findByProps } from "@vendetta/metro";
import TextButton from "./TextButton";

const Alerts = findByProps("openLazy", "close");

export default function ({
  title,
  body,
  confirmColor,
  confirmText,
  onConfirm,
  cancelText,
  onCancel,
  secondaryConfirmText,
  onConfirmSecondary,
}: Omit<ConfirmationAlertOptions, "content"> & {
  body?: ConfirmationAlertOptions["content"];
}) {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      backgroundColor: resolveCustomSemantic(
        rawColors.PRIMARY_600,
        rawColors.PRIMARY_100
      ),
      borderRadius: 28,
      flexDirection: "column",
    },
    textContent: {
      width: "100%",
      flexDirection: "column",
      gap: 16,
      paddingHorizontal: 24,
      paddingTop: 24,
    },
    actions: {
      width: "100%",
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8,
      paddingLeft: 8,
      marginRight: -24,
      paddingVertical: 24,
    },
  });

  const empty = Symbol("empty");
  const things = [
    {
      color: confirmColor
        ? ["grey", "lightgrey", "white", "link", "transparent"].includes(
            confirmColor
          )
          ? "NORMAL"
          : confirmColor.toUpperCase()
        : "BRAND",
      text: confirmText ?? "Confirm",
      action: onConfirm,
    },
    cancelText
      ? {
          color: "BRAND",
          text: cancelText,
          action: onCancel,
        }
      : empty,
    secondaryConfirmText
      ? {
          color: "BRAND",
          text: secondaryConfirmText,
          action: onConfirmSecondary,
        }
      : empty,
  ].filter((x) => x !== empty) as {
    color: string;
    text: string;
    action?: () => void;
  }[];

  return (
    <RN.View style={styles.container}>
      <RN.View style={styles.textContent}>
        <SimpleText variant="text-lg/semibold" color="TEXT_NORMAL">
          {title}
        </SimpleText>
        <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
          {body}
        </SimpleText>
      </RN.View>
      <RN.View style={styles.actions}>
        {things.map((x) => (
          <TextButton
            color={x.color}
            label={x.text}
            onPress={() => {
              Alerts.close();
              x.action?.();
            }}
          />
        ))}
      </RN.View>
    </RN.View>
  );
}
