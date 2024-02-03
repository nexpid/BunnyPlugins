import { clipboard } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import SimpleText from "$/components/SimpleText";
import SmartMention from "$/components/SmartMention";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  hideActionSheet,
} from "$/types";

import { active, lang } from "../..";

const { FormRow } = Forms;

const parseAuthor = (x: string) => {
  const splat = x.split(" <");
  if (splat[1]) return [splat[0], splat[1].slice(0, -1)];
  else return [splat[0]];
};

export default function () {
  const { iconpack } = active;

  const iconpackAuthors = [];
  if (iconpack) {
    for (let i = 0; i < iconpack.credits.authors.length; i++) {
      const aut = parseAuthor(iconpack.credits.authors[i]);
      if (aut[1])
        iconpackAuthors.push(
          <SmartMention userId={aut[1]} loadUsername={false} color="TEXT_LINK">
            {aut[0]}
          </SmartMention>,
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
              [
                lang.format("sheet.iconpack_info.description", {}),
                [iconpack.description],
              ],
              [
                lang.format("sheet.iconpack_info.authors", {}),
                iconpackAuthors,
                iconpack.credits.authors
                  .map((x) => parseAuthor(x)[0])
                  .join(", "),
              ],
              [
                lang.format("sheet.iconpack_info.source", {}),
                [iconpack.credits.source],
              ],
              [
                lang.format("sheet.iconpack_info.file_suffix", {}),
                [iconpack.suffix ?? "-"],
              ],
              [
                lang.format("sheet.iconpack_info.base_url", {}),
                [iconpack.load ?? "-"],
              ],
            ].map(
              ([label, val, copyable]: [string, any[], string | undefined]) => (
                <FormRow
                  label={val}
                  subLabel={label}
                  onLongPress={() => {
                    clipboard.setString(copyable ?? val.join(""));
                    showToast(
                      lang.format("toast.copied_iconpack_info_value", {}),
                      getAssetIDByName("toast_copy_link"),
                    );
                  }}
                />
              ),
            )}
          </>
        ) : (
          <SimpleText variant="text-md/semibold" color="TEXT_NORMAL">
            {lang.format("sheet.iconpack_info.failed_to_load", {})}
          </SimpleText>
        )}
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
