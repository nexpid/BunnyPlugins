import { useProxy } from "@vendetta/storage";
import { cache, vstorage } from "..";
import { Forms, General } from "@vendetta/ui/components";
import {
  BetterTableRowGroup,
  SimpleText,
  openSheet,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import {
  currentAuthorization,
  deleteSaveData,
  syncSaveData,
} from "../stuff/api";
import { findByStoreName } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { openOauth2Modal } from "../stuff/oauth2";
import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import SongSheet from "./sheets/SongSheet";
import PendingSongName from "./PendingSongName";
import { hsync } from "../stuff/http";

const { ScrollView, View } = General;
const { FormRow } = Forms;

const UserStore = findByStoreName("UserStore");

export default function () {
  useProxy(cache);
  useProxy(vstorage);

  const styles = stylesheet.createThemedStyleSheet({
    song: {
      backgroundColor: semanticColors.BG_MOD_FAINT,
      borderRadius: 8,
    },
    serviceFrame: {
      height: 24,
      width: 24,
      backgroundColor: semanticColors.BG_MOD_FAINT,
      borderRadius: 2147483647,
    },
  });

  const isAuthed = !!currentAuthorization();
  const hasData = !!cache.data;

  return (
    <ScrollView>
      <BetterTableRowGroup
        title="Songs"
        icon={getAssetIDByName("abc")}
        padding={true}
      >
        {isAuthed && hasData ? (
          <View
            style={{
              flexDirection: "column",
              gap: 8,
            }}
          >
            {cache.data.songs.map((x, i) => {
              const isNull = x === null || !x.id;
              return (
                <FormRow
                  label={
                    isNull ? (
                      "Press to add song in this position"
                    ) : (
                      <PendingSongName
                        service={x.service}
                        type={x.type}
                        id={x.id}
                        normal={true}
                      />
                    )
                  }
                  leading={
                    isNull ? (
                      <View style={styles.serviceFrame} />
                    ) : (
                      <RN.Image
                        style={styles.serviceFrame}
                        source={getAssetIDByName(
                          "img_account_sync_spotify_light_and_dark"
                        )}
                      />
                    )
                  }
                  onPress={() =>
                    openSheet(SongSheet, {
                      song: x ?? {
                        service: "spotify",
                        type: "track",
                        id: null,
                      },
                      update: (y) => {
                        cache.data.songs[i] = y?.id ? y : null;
                        hsync(async () => await syncSaveData(cache.data.songs));
                      },
                    })
                  }
                  style={styles.song}
                />
              );
            })}
          </View>
        ) : !isAuthed ? (
          <SimpleText
            variant="text-md/semibold"
            color="TEXT_NORMAL"
            align="center"
          >
            Authenticate first to manage your songs
          </SimpleText>
        ) : (
          <RN.ActivityIndicator size="small" style={{ flex: 1 }} />
        )}
      </BetterTableRowGroup>
      <BetterTableRowGroup
        title="Authentication"
        icon={getAssetIDByName("lock")}
      >
        {currentAuthorization() ? (
          <>
            <FormRow
              label="Log out"
              subLabel="Logs you out of SongSpotlight"
              leading={
                <FormRow.Icon source={getAssetIDByName("ic_logout_24px")} />
              }
              onPress={() => {
                vstorage.auth ??= {};
                delete vstorage.auth[UserStore.getCurrentUser().id];
                delete cache.data;

                showToast(
                  "Successfully logged out",
                  getAssetIDByName("ic_logout_24px")
                );
              }}
            />
            <FormRow
              label="Delete data"
              subLabel="Deletes your SongSpotlight data"
              leading={<FormRow.Icon source={getAssetIDByName("trash")} />}
              onPress={async () => {
                await deleteSaveData();
                vstorage.auth ??= {};
                delete vstorage.auth[UserStore.getCurrentUser().id];
                delete cache.data;

                showToast(
                  "Successfully deleted data",
                  getAssetIDByName("trash")
                );
              }}
            />
          </>
        ) : (
          <FormRow
            label="Authenticate"
            leading={<FormRow.Icon source={getAssetIDByName("copy")} />}
            trailing={FormRow.Arrow}
            onPress={openOauth2Modal}
          />
        )}
      </BetterTableRowGroup>
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}
