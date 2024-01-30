import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  hideActionSheet,
} from "$/types";

export default function ColorSheet({
  title,
  color: _color,
}: {
  title: string;
  color: string;
}) {
  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title={title}
          trailing={
            <ActionSheetCloseButton onPress={() => hideActionSheet()} />
          }
        />
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
