import { find, findByProps } from "@vendetta/metro";

const _ActionSheet =
  findByProps("ActionSheet")?.ActionSheet ??
  find((x) => x.render?.name === "ActionSheet"); // thank you to @pylixonly for fixing this

const { ActionSheetTitleHeader, ActionSheetCloseButton } = findByProps(
  "ActionSheetTitleHeader",
  "ActionSheetCloseButton",
);

export const LazyActionSheet = findByProps("openLazy", "hideActionSheet") as {
  openLazy: (component: Promise<any>, key: string, props?: object) => void;
  hideActionSheet: () => void;
};
export const { openLazy, hideActionSheet } = LazyActionSheet;

type ActionSheetProps = React.PropsWithChildren<{
  title: string;
  onClose?: () => void;
}>;

export const ActionSheet = (({
  title,
  onClose,
  children,
}: ActionSheetProps) => {
  return (
    <_ActionSheet>
      <ActionSheetTitleHeader
        title={title}
        trailing={
          <ActionSheetCloseButton
            onPress={onClose ?? (() => hideActionSheet())}
          />
        }
      />
      {children}
    </_ActionSheet>
  );
}) as {
  (props: ActionSheetProps): JSX.Element;
  open: <Sheet extends React.FunctionComponent>(
    sheet: Sheet,
    props: Parameters<Sheet>[0],
  ) => void;
};
ActionSheet.open = (sheet, props) => {
  openLazy(
    new Promise((res) =>
      res({
        default: sheet,
      }),
    ) as any,
    "ActionSheet",
    props,
  );
};
