import { React } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";

import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  hideActionSheet,
} from "$/types";

const { FormRadioRow } = Forms;

export default function ({
  title,
  value: _value,
  options,
  callback,
}: {
  title: string;
  value: string | number | null;
  options: {
    name: string;
    value: typeof _value;
  }[];
  callback: (v: typeof _value) => void;
}) {
  const [value, setValue] = React.useState(_value);

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title={title}
          trailing={
            <ActionSheetCloseButton onPress={() => hideActionSheet()} />
          }
        />
        {options.map((x) => (
          <FormRadioRow
            label={x.name}
            onPress={() => {
              setValue(x.value);
              callback(x.value);
            }}
            selected={x.value === value}
          />
        ))}
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
