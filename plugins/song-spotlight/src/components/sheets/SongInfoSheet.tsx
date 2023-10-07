import { Forms } from "@vendetta/ui/components";
import {
  ActionSheet,
  ActionSheetCloseButton,
  ActionSheetContentContainer,
  ActionSheetTitleHeader,
  SimpleText,
  hideActionSheet,
} from "../../../../../stuff/types";
import { API } from "../../types/api";
import {
  ReactNative as RN,
  clipboard,
  stylesheet,
  url,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { openSpotify, rebuildLink } from "../../stuff/util";
import { showToast } from "@vendetta/ui/toasts";
import { cache } from "../..";
import { check } from "../../stuff/http";

const { FormRow } = Forms;

const destructiveText = {
  color: "TEXT_DANGER",
  variant: "text-md/semibold",
};

export default function ({
  song,
  remove,
  showAdd,
}: {
  song: API.Song;
  remove?: () => void;
  showAdd?: boolean;
}) {
  const styles = stylesheet.createThemedStyleSheet({
    destructiveIcon: {
      tintColor: semanticColors.TEXT_DANGER,
    },
  });

  return (
    <ActionSheet>
      <ActionSheetContentContainer>
        <ActionSheetTitleHeader
          title={"Edit Song"}
          trailing={<ActionSheetCloseButton onPress={hideActionSheet} />}
        />
        {song.service === "spotify" && (
          <FormRow
            label="Open in Spotify"
            leading={
              <FormRow.Icon
                source={getAssetIDByName(
                  "img_account_sync_spotify_light_and_dark"
                )}
              />
            }
            onPress={() => {
              openSpotify(`spotify://${song.type}/${song.id}`);
              hideActionSheet();
            }}
          />
        )}
        <FormRow
          label="Copy link"
          leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
          onPress={() => {
            clipboard.setString(rebuildLink(song.service, song.type, song.id));
            showToast(
              "Copied to clipboard.",
              getAssetIDByName("toast_copy_link")
            );
            hideActionSheet();
          }}
        />
        {showAdd && (
          <FormRow
            label="Add to your profile"
            leading={<FormRow.Icon source={getAssetIDByName("ic_pin")} />}
            onPress={() => {
              hideActionSheet();

              const songs = cache.data?.songs;
              if (!songs) return;

              const available = songs.findIndex((x) => x === null);
              if (available === -1)
                return showToast("No space left!", getAssetIDByName("Small"));

              songs[available] = song;
              check();

              showToast("Added to your profile", getAssetIDByName("Check"));
            }}
          />
        )}
        {remove && (
          <FormRow
            label={<SimpleText {...destructiveText}>Remove song</SimpleText>}
            leading={
              <FormRow.Icon
                style={styles.destructiveIcon}
                source={getAssetIDByName("trash")}
              />
            }
            onPress={() => {
              remove();
              showToast("Removed", getAssetIDByName("toast_trash"));
              hideActionSheet();
            }}
          />
        )}
      </ActionSheetContentContainer>
    </ActionSheet>
  );
}
