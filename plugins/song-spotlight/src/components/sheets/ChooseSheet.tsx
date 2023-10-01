import { React } from "@vendetta/metro/common";
import { Button, Forms } from "@vendetta/ui/components";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  hideActionSheet,
} from "../../../../../stuff/types";

const { FormRadioRow } = Forms;

export default function ChooseSheet({
  label,
  value: _value,
  choices,
  update,
}: {
  label: string;
  value: string;
  choices: string[];
  update: (val: string) => void;
}) {
  const [value, setValue] = React.useState(_value);

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title={label}
          trailing={
            <ActionSheetCloseButton onPress={() => hideActionSheet()} />
          }
        />
        {choices.map((x) => (
          <FormRadioRow
            label={x}
            onPress={() => setValue(x)}
            selected={value === x}
          />
        ))}
        <Button
          text="Done"
          color="green"
          size="medium"
          onPress={() => update(value)}
          style={{ marginTop: 8, marginHorizontal: 16 }}
        />
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
