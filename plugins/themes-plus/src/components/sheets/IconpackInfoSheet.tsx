import { Forms } from "@vendetta/ui/components";
import { active } from "../..";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  SimpleText,
  hideActionSheet,
} from "../../../../../stuff/types";
import SmartMention from "../../../../../stuff/components/SmartMention";
import { clipboard } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { FormRow } = Forms;

const parseAuthor = (x: string) => {
  const splat = x.split(" <");
  if (splat[1]) return [splat[0], splat[1].slice(0, -1)];
  else return [splat[0]];
};

export default function ({}) {
  const { iconpack } = active;

  const iconpackAuthors = [];
  if (iconpack) {
    for (let i = 0; i < iconpack.credits.authors.length; i++) {
      const aut = parseAuthor(iconpack.credits.authors[i]);
      if (aut[1])
        iconpackAuthors.push(
          <SmartMention userId={aut[1]} loadUsername={false} color="TEXT_LINK">
            {aut[0]}
          </SmartMention>
        );
      else iconpackAuthors.push(aut[0]);

      if (i !== iconpack.credits.authors.length - 1) iconpackAuthors.push(", ");
    }
  }

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        {iconpack ? (
          <>
            <ActionSheetTitleHeader
              title={iconpack.id}
              trailing={
                <ActionSheetCloseButton onPress={() => hideActionSheet()} />
              }
            />
            {[
              ["Description", [iconpack.description]],
              [
                "Authors",
                iconpackAuthors,
                iconpack.credits.authors
                  .map((x) => parseAuthor(x)[0])
                  .join(", "),
              ],
              ["Description", [iconpack.description]],
              ["Source", [iconpack.credits.source]],
              ["Icon Suffix", [iconpack.suffix ?? "N/A"]],
              ["Load URL", [iconpack.load ?? "N/A"]],
            ].map(
              ([label, val, copyable]: [string, any[], string | undefined]) => (
                <FormRow
                  label={val}
                  subLabel={label}
                  onLongPress={() => {
                    clipboard.setString(copyable ?? val.join(""));
                    showToast("Copied", getAssetIDByName("toast_copy_link"));
                  }}
                />
              )
            )}
          </>
        ) : (
          <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
            womp womp
          </SimpleText>
        )}
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
