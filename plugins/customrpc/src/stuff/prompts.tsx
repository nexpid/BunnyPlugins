import { constants } from "@vendetta";
import { find, findByProps } from "@vendetta/metro";
import { showConfirmationAlert, showInputAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary, Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { getExternalAsset } from "./api";
import { showRichAssetList } from "../components/pages/RichAssetList";
import { showApplicationList } from "../components/pages/ApplicationList";
import { ActivityType, isActivitySaved } from "./activity";
import { activityTypePreview } from "../components/Settings";
import { React, stylesheet } from "@vendetta/metro/common";
import { RichText, SimpleText } from "../../../../stuff/types";
import { vstorage } from "..";
import { unparseTimestamp } from "./util";
import { imageVariables, timestampVariables } from "./variables";
import { semanticColors } from "@vendetta/ui";

const { View, ScrollView } = General;
const { FormRow, FormRadioRow } = Forms;

const {
  default: { render: ActionSheet },
} = find((x) => x.default?.render?.name === "ActionSheet") ?? {
  default: { render: false },
};
const LazyActionSheet = findByProps("openLazy", "hideActionSheet");
const { ActionSheetTitleHeader, ActionSheetCloseButton } = findByProps(
  "ActionSheetTitleHeader",
  "ActionSheetCloseButton"
);
const DatePicker = findByProps("DatePickerModes");

const SheetFooter = () => <View style={{ marginBottom: 16 }} />;

export function openSheet(sheet: any, props: any) {
  ActionSheet
    ? LazyActionSheet.openLazy(
        new Promise((x) => x({ default: sheet })),
        "ActionSheet",
        props
      )
    : showToast(
        "You cannot open ActionSheets on this version! Update to 163+",
        getAssetIDByName("Small")
      );
}

const styles = stylesheet.createThemedStyleSheet({
  destructiveIcon: {
    tintColor: semanticColors.TEXT_DANGER,
  },
});
const destructiveText = {
  color: "TEXT_DANGER",
  variant: "text-md/semibold",
};

export function ImageVariableActionSheet({
  role,
  update,
}: {
  role: string;
  update: (v: string) => void;
}) {
  return (
    <ActionSheet>
      <ScrollView>
        <ActionSheetTitleHeader
          title={`${role} Image Variable`}
          trailing={
            <ActionSheetCloseButton
              onPress={() => LazyActionSheet.hideActionSheet()}
            />
          }
        />
        {imageVariables.map((x) => (
          <FormRow
            label={x.title}
            subLabel={x.description}
            trailing={<FormRow.Arrow />}
            onPress={() => {
              update(x.format);
              LazyActionSheet.hideActionSheet();
            }}
          />
        ))}
      </ScrollView>
      <SheetFooter />
    </ActionSheet>
  );
}

export let richAssetListCallback: (prop: string) => void;
export let richAssetListAppId: string;
export function ImageActionSheet({
  appId,
  role,
  image,
  navigation,
  update,
}: {
  appId: string;
  role: string;
  image: string | undefined;
  navigation: any;
  update: (img: string | undefined) => void;
}): React.JSX.Element {
  return (
    <ActionSheet>
      <ScrollView>
        <ActionSheetTitleHeader
          title={`Edit ${role} Image`}
          trailing={
            <ActionSheetCloseButton onPress={LazyActionSheet.hideActionSheet} />
          }
        />
        <FormRow
          label="Set Image Variable"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_essentials_sparkle")} />
          }
          trailing={<FormRow.Arrow />}
          onPress={() =>
            openSheet(ImageVariableActionSheet, {
              role,
              update: (v: string) => update(v),
            })
          }
        />
        <FormRow
          label="Use Custom Image"
          subLabel="Make sure your image is in a square aspect ratio"
          leading={<FormRow.Icon source={getAssetIDByName("ic_link")} />}
          onPress={() => {
            showInputAlert({
              title: "Enter the link to your image link",
              placeholder: "can be a discord attachment CDN link",
              confirmText: "Proxy",
              confirmColor: "brand" as ButtonColors,
              cancelText: "Cancel",
              onConfirm: async function (d) {
                const url = d.match(constants.HTTP_REGEX_MULTI)?.[0];
                if (!url)
                  return showToast("Invalid URL", getAssetIDByName("Small"));
                showToast("Proxying image...", getAssetIDByName("ic_clock"));
                try {
                  update(`mp:${await getExternalAsset(url)}`);
                  showToast("Proxied image", getAssetIDByName("Check"));
                } catch (p) {
                  console.log(p);
                  showToast("Failed to proxy image", getAssetIDByName("Small"));
                }
              },
            });
          }}
        />
        <FormRow
          label="Select RPC Asset"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_media_channel")} />
          }
          trailing={<FormRow.Arrow />}
          onPress={() => {
            if (!appId)
              return showConfirmationAlert({
                title: "No App Set",
                content: "An app must be selected in order to use RPC assets",
                confirmText: "Ok",
                confirmColor: "grey" as ButtonColors,
                onConfirm: () => {},
              });

            richAssetListAppId = appId;
            richAssetListCallback = (x) => {
              richAssetListCallback = undefined;
              update(x);
            };
            showRichAssetList(navigation);
            LazyActionSheet.hideActionSheet();
          }}
        />
        {image && (
          <FormRow
            label={<SimpleText {...destructiveText}>Remove Image</SimpleText>}
            leading={
              <FormRow.Icon
                style={styles.destructiveIcon}
                source={getAssetIDByName("trash")}
              />
            }
            onPress={() => {
              update(undefined);
              LazyActionSheet.hideActionSheet();
            }}
          />
        )}
      </ScrollView>
      <SheetFooter />
    </ActionSheet>
  );
}

export function ButtonActionSheet({
  role,
  text,
  url,
  update,
}: {
  role: string;
  text: string | undefined;
  url: string | undefined;
  update: (props: { text: string; url: string | undefined }) => void;
}) {
  return (
    <ActionSheet>
      <ScrollView>
        <ActionSheetTitleHeader
          title={`Edit Button ${role}`}
          trailing={
            <ActionSheetCloseButton onPress={LazyActionSheet.hideActionSheet} />
          }
        />
        <FormRow
          label="Button Text"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          onPress={() =>
            simpleInput({
              role: `Button ${role} Text`,
              current: text,
              update: (x) => update({ text: x, url }),
            })
          }
        />
        <FormRow
          label="Button URL"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          onPress={() =>
            simpleInput({
              role: `Button ${role} URL`,
              current: url,
              update: (x) => update({ text, url: x }),
            })
          }
        />
        {url && (
          <FormRow
            label={
              <SimpleText {...destructiveText}>Remove Button URL</SimpleText>
            }
            leading={
              <FormRow.Icon
                style={styles.destructiveIcon}
                source={getAssetIDByName("trash")}
              />
            }
            onPress={() => {
              update({ text, url: undefined });
              LazyActionSheet.hideActionSheet();
            }}
          />
        )}
        {text && (
          <FormRow
            label={<SimpleText {...destructiveText}>Remove Button</SimpleText>}
            leading={
              <FormRow.Icon
                style={styles.destructiveIcon}
                source={getAssetIDByName("trash")}
              />
            }
            onPress={() => {
              update(undefined);
              LazyActionSheet.hideActionSheet();
            }}
          />
        )}
      </ScrollView>
      <SheetFooter />
    </ActionSheet>
  );
}

export let applicationListCallback: (props: {
  id?: string;
  name?: string;
}) => void;
export function ApplicationActionSheet({
  appId,
  appName,
  navigation,
  update,
}: {
  appId: string | undefined;
  appName: string | undefined;
  navigation: any;
  update: (
    props: { id: string | undefined; name: string | undefined } | undefined
  ) => void;
}) {
  return (
    <ActionSheet>
      <ScrollView>
        <ActionSheetTitleHeader
          title={"Edit Application"}
          trailing={
            <ActionSheetCloseButton onPress={LazyActionSheet.hideActionSheet} />
          }
        />
        <FormRow
          label="Application Name"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          onPress={() =>
            simpleInput({
              role: "Application Name",
              current: appName,
              update: (txt) => update({ id: appId, name: txt }),
            })
          }
        />
        <FormRow
          label="Select Application"
          leading={<FormRow.Icon source={getAssetIDByName("ic_robot_24px")} />}
          trailing={<FormRow.Arrow />}
          onPress={() => {
            applicationListCallback = (props) => {
              applicationListCallback = undefined;
              update({
                id: props.id ?? appId,
                name: props.name ?? appName,
              });
            };
            showApplicationList(navigation);
            LazyActionSheet.hideActionSheet();
          }}
        />
        {appId && (
          <FormRow
            label={
              <SimpleText {...destructiveText}>Remove Application</SimpleText>
            }
            leading={
              <FormRow.Icon
                style={styles.destructiveIcon}
                source={getAssetIDByName("trash")}
              />
            }
            onPress={() => {
              update(undefined);
              LazyActionSheet.hideActionSheet();
            }}
          />
        )}
      </ScrollView>
      <SheetFooter />
    </ActionSheet>
  );
}

export function ActivityTypeActionSheet({
  type,
  update,
}: {
  type: ActivityType;
  update: (type: ActivityType) => void;
}) {
  const [val, setVal] = React.useState(type);
  return (
    <ActionSheet>
      <ScrollView>
        <ActionSheetTitleHeader
          title="Edit Activity Type"
          trailing={
            <ActionSheetCloseButton
              onPress={() => LazyActionSheet.hideActionSheet()}
            />
          }
        />
        {...Object.values(ActivityType)
          .filter((x) => typeof x === "number")
          .map((x: number) => (
            <FormRadioRow
              label={activityTypePreview[x]}
              trailing={<FormRow.Arrow />}
              selected={x === val}
              onPress={() => {
                update(x);
                setVal(x);
              }}
            />
          ))}
      </ScrollView>
      <SheetFooter />
    </ActionSheet>
  );
}

export function TimestampVariableActionSheet({
  role,
  update,
}: {
  role: string;
  update: (v: string) => void;
}) {
  return (
    <ActionSheet>
      <ScrollView>
        <ActionSheetTitleHeader
          title={`Set ${role} Time Variable`}
          trailing={
            <ActionSheetCloseButton
              onPress={() => LazyActionSheet.hideActionSheet()}
            />
          }
        />
        {timestampVariables.map((x) => (
          <FormRow
            label={x.title}
            subLabel={x.description}
            trailing={<FormRow.Arrow />}
            onPress={() => {
              update(x.format);
              LazyActionSheet.hideActionSheet();
            }}
          />
        ))}
      </ScrollView>
      <SheetFooter />
    </ActionSheet>
  );
}
export function TimestampActionSheet({
  start,
  end,
  update,
}: {
  start: string | number | undefined;
  end: string | number | undefined;
  update: (props: {
    start: string | number | undefined;
    end: string | number | undefined;
  }) => void;
}) {
  const prompt = ({
    role,
    onSubmit,
  }: {
    role: string;
    onSubmit: (time: number) => void;
  }) => {
    const sOD = new Date().setHours(0, 0, 0, 0);
    const eOD = new Date().setHours(23, 59, 59, 999);

    LazyActionSheet.openLazy(Promise.resolve(DatePicker), "DatePicker", {
      onSubmit: (x: any) => {
        return onSubmit(unparseTimestamp(x._d.getTime()));
      },
      title: `Timestamp ${role} Time`,
      startDate: new Date(),
      minimumDate: new Date(sOD),
      maximumDate: new Date(eOD),
      requireDateChanged: false,
      mode: "time",
    });
  };

  return (
    <ActionSheet>
      <ScrollView>
        <ActionSheetTitleHeader
          title="Edit Timestamp"
          trailing={
            <ActionSheetCloseButton
              onPress={() => LazyActionSheet.hideActionSheet()}
            />
          }
        />
        <FormRow
          label="Set Start Time Variable"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_essentials_sparkle")} />
          }
          trailing={<FormRow.Arrow />}
          onPress={() =>
            openSheet(TimestampVariableActionSheet, {
              role: "Start",
              update: (v: string) => update({ start: v, end }),
            })
          }
        />
        {typeof start !== "string" && (
          <FormRow
            label="Edit Start Time"
            leading={
              <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
            }
            trailing={<FormRow.Arrow />}
            onPress={() =>
              prompt({
                role: "Start",
                onSubmit: (v) => update({ start: v, end }),
              })
            }
          />
        )}
        {start !== undefined && (
          <FormRow
            label={
              <SimpleText {...destructiveText}>Remove Start Time</SimpleText>
            }
            leading={
              <FormRow.Icon
                style={styles.destructiveIcon}
                source={getAssetIDByName("trash")}
              />
            }
            onPress={() => {
              update({ start: undefined, end });
              LazyActionSheet.hideActionSheet();
            }}
          />
        )}
        <FormRow
          label="Set End Time Variable"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_essentials_sparkle")} />
          }
          trailing={<FormRow.Arrow />}
          onPress={() =>
            openSheet(TimestampVariableActionSheet, {
              role: "End",
              update: (v: string) => update({ start, end: v }),
            })
          }
        />
        {typeof end !== "string" && (
          <FormRow
            label="Edit End Time"
            leading={
              <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
            }
            onPress={() =>
              prompt({
                role: "End",
                onSubmit: (v) => update({ start, end: v }),
              })
            }
          />
        )}
        {end !== undefined && (
          <FormRow
            label={
              <SimpleText {...destructiveText}>Remove End Time</SimpleText>
            }
            leading={
              <FormRow.Icon
                style={styles.destructiveIcon}
                source={getAssetIDByName("trash")}
              />
            }
            onPress={() => {
              update({ start, end: undefined });
              LazyActionSheet.hideActionSheet();
            }}
          />
        )}
      </ScrollView>
      <SheetFooter />
    </ActionSheet>
  );
}

export const activitySavedPrompt = ({
  role,
  button,
  secondaryButton,
  run,
  secondaryRun,
}: {
  role: string;
  button: string;
  secondaryButton?: string;
  run: () => void;
  secondaryRun?: () => void;
}) => {
  if (isActivitySaved()) return run();
  else
    showConfirmationAlert({
      title: "Unsaved Changes",
      content: [
        "You have unsaved changes in ",
        <RichText.Bold>{vstorage.activity.profile}</RichText.Bold>,
        `. Are you sure you want to ${role}?`,
      ],
      confirmText: button,
      confirmColor: "red" as ButtonColors,
      cancelText: "Cancel",
      onConfirm: run,
      secondaryConfirmText: secondaryButton,
      onConfirmSecondary: () => {
        secondaryRun?.();
        run?.();
      },
    });
};

export const simpleInput = ({
  role,
  current,
  update,
}: {
  role: string;
  current: string | undefined;
  update: (txt: string) => void;
}) =>
  showInputAlert({
    title: `Enter New ${role}`,
    confirmText: "Change",
    confirmColor: "brand" as ButtonColors,
    cancelText: "Cancel",
    initialValue: current,
    placeholder: `really cool ${role.toLowerCase()}`,
    onConfirm: update,
  });
