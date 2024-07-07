import { findByProps } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";

import { Button, TextInput } from "$/lib/redesign";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  hideActionSheet,
} from "$/types";

const { FormRow } = Forms;

const DocumentPicker = findByProps("pickSingle", "isCancel");

export default function AddBackgroundSheet({
  add,
}: {
  add: (title: string, location: string) => void;
}) {
  const [file, setFile] = React.useState<{
    name: string;
    path: string;
  }>(null);
  const [name, setName] = React.useState("");

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title={"Add custom background"}
          trailing={
            <ActionSheetCloseButton onPress={() => hideActionSheet()} />
          }
        />
        <FormRow
          label="Select an image"
          subLabel={file?.name}
          leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
          onPress={() => {
            DocumentPicker.pickSingle({
              type: DocumentPicker.types.images,
              mode: "open",
              copyTo: "documentDirectory",
            }).then((file: any) => {
              setFile({
                name: file.name,
                path: file.fileCopyUri,
              });
            });
          }}
        />
        <TextInput
          size="md"
          label="Title"
          placeholder="New background"
          value={name}
          onChange={(x) => setName(x)}
        />
        <RN.View style={{ height: 8 }} />
        <Button
          text="Add"
          variant="primary"
          size="md"
          iconPosition="start"
          icon={getAssetIDByName("PlusIcon")}
          onPress={() => {
            add(name, `file://${file.path}`);
            hideActionSheet();
          }}
          disabled={!file || !name}
        />
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
