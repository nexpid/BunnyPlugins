import { React, lodash, stylesheet } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  SimpleText,
  hideActionSheet,
  openSheet,
} from "../../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import ChooseSheet from "./ChooseSheet";
import { semanticColors } from "@vendetta/ui";
import { validateSong } from "../../stuff/songs";
import { showInputAlert } from "@vendetta/ui/alerts";
import { EditableSong } from "../../types";
import PendingSongName from "../PendingSongName";

const { FormRow } = Forms;

const styles = stylesheet.createThemedStyleSheet({
  destructiveIcon: {
    tintColor: semanticColors.TEXT_DANGER,
  },
});
const destructiveText = {
  color: "TEXT_DANGER",
  variant: "text-md/semibold",
};

export default function SongSheet({
  song,
  update,
}: {
  song: EditableSong;
  update: (x: EditableSong) => void;
}) {
  update(song);

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title="Update Song Entry"
          trailing={
            <ActionSheetCloseButton onPress={() => hideActionSheet()} />
          }
        />
        <FormRow
          label="Song Service"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          trailing={
            <SimpleText variant="text-md/medium" color="TEXT_MUTED">
              {lodash.startCase(song.service)}
            </SimpleText>
          }
          disabled={true}
        />
        <FormRow
          label="Song Type"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          trailing={
            <SimpleText variant="text-md/medium" color="TEXT_MUTED">
              {lodash.startCase(song.type)}
            </SimpleText>
          }
          onPress={() =>
            openSheet(ChooseSheet, {
              label: "Song Type",
              value: lodash.startCase(song.type),
              choices: ["Track", "Album"],
              update: (val) => {
                openSheet(SongSheet, {
                  song: {
                    ...song,
                    type: val.toLowerCase(),
                    id: val !== song.type ? null : song.id,
                  } as any,
                  update,
                });
              },
            })
          }
        />
        <FormRow
          label="Song"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_edit")} />
          }
          trailing={
            <PendingSongName
              service={song.service}
              type={song.type}
              id={song.id}
              normal={false}
            />
          }
          onPress={() =>
            showInputAlert({
              title: `Enter song link`,
              placeholder: `https://open.spotify.com/${
                song.type ?? "track"
              }/ABC`,
              confirmText: "Enter",
              onConfirm: async (inp) => {
                if (!inp) return openSheet(SongSheet, { song, update });

                const [_, type, id] =
                  inp.match(
                    /open\.spotify\.com\/(track|album)\/([a-z0-9]+)/i
                  ) ?? [];
                if (type !== song.type || !id) throw new Error("Invalid link");

                const valid = await validateSong(song.service, song.type, id);
                if (!valid) throw new Error("Song is invalid");

                openSheet(SongSheet, {
                  song: {
                    ...song,
                    id,
                  },
                  update,
                });
              },
            })
          }
        />
        <FormRow
          label={
            <SimpleText {...destructiveText}>Remove Song Entry</SimpleText>
          }
          leading={
            <FormRow.Icon
              style={styles.destructiveIcon}
              source={getAssetIDByName("trash")}
            />
          }
          onPress={() => {
            update(null);
            hideActionSheet();
          }}
        />
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
