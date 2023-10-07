import spotifyAudioWebView from "../../assets/spotifyAudioWebView.html";
import pause from "../../assets/pause.svg";
import play from "../../assets/play.svg";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { API } from "../types/api";
import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { currentAuthorization, getProfileData } from "../stuff/api";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { semanticColors } from "@vendetta/ui";
import { cache } from "..";
import { getSongData, SpotifyEmbedEntity } from "../stuff/songs";
import {
  lerp,
  resolveCustomSemantic,
} from "../../../nexxutils/src/stuff/colors";
import {
  openSheet,
  SimpleText,
  SvgXml,
  WebView,
} from "../../../../stuff/types";
import SongInfoSheet from "./sheets/SongInfoSheet";
import { check } from "../stuff/http";

const { View, ScrollView } = General;

const UserProfileSection = findByName("UserProfileSection");
const { YouScreenProfileCard } = findByProps("YouScreenProfileCard");

const { TableRowGroupTitle } = findByProps("TableRowGroupTitle");

const UserStore = findByStoreName("UserStore");

const playingRn = new Map<string, () => void>();

const SpotifySongEmbed = ({
  song,
  showAdd,
  remove,
}: {
  song: API.Song;
  showAdd: boolean;
  remove?: () => void;
}) => {
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);

  const [songData, setSongData] = React.useState<SpotifyEmbedEntity | false>(
    undefined
  );
  const ratio =
    (songData && songData.type === "track") || song.type === "track"
      ? 600 / 152
      : 600 / 352;
  const audioWebviewRef = React.useRef<any>(null);

  const skey = React.useRef(Math.random().toString()).current;

  React.useEffect(() => {
    if (playing) playingRn.forEach((x, k) => k !== skey && x());
    audioWebviewRef.current?.injectJavaScript(
      `window.postMessage(${JSON.stringify({
        action: playing ? "play" : "pause",
        pos: position,
      })})`
    );
  }, [playing, position]);

  playingRn.set(skey, () => setPlaying(false));
  React.useEffect(
    () => () => {
      playingRn.delete(skey);
    },
    []
  );

  const background =
    songData &&
    (songData.coverArt.extractedColors.colorLight
      ? resolveCustomSemantic(
          songData.coverArt.extractedColors.colorDark.hex,
          songData.coverArt.extractedColors.colorLight.hex
        )
      : songData.coverArt.extractedColors.colorDark.hex);

  const styles = stylesheet.createThemedStyleSheet({
    emptyCard: {
      width: "100%",
      aspectRatio: ratio,
      backgroundColor: semanticColors.BG_MOD_FAINT,
      borderRadius: 12,
    },

    card: {
      width: "100%",
      backgroundColor: background && lerp(background, "#000000", 0.15),
      aspectRatio: ratio,
      borderRadius: 12,
      flexDirection: "column",
    },
    cardFirst: {
      backgroundColor: background,
      width: "100%",
      height: "100%",
      borderRadius: 12,
    },
    cardFirstContent: {
      flexDirection: "row",
      gap: 8,
      padding: 10,
    },
    cardImage: {
      height: "100%",
      aspectRatio: 1,
      borderRadius: 8,
      backgroundColor: semanticColors.BG_MOD_SUBTLE,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,

      elevation: 8,
    },
    cardContent: {
      width: "90%",
      flexDirection: "column",
      gap: 2,
      justifyContent: "center",
      flexGrow: 0,
      flexShrink: 0,
    },
    cardContentArtist: {
      flexDirection: "row",
      gap: 4,
      alignItems: "center",
      flexGrow: 0,
      flexShrink: 0,
    },
    cardContentTag: {
      backgroundColor: "#ffffffb3",
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
    },
    cardOther: {
      position: "absolute",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-end",
      padding: 10,
    },

    cardTracklist: {
      height: "100%",
      paddingHorizontal: 8,
      flexDirection: "column",
    },
    cardTracklistEntry: {
      backgroundColor: background && lerp(background, "#000000", 0.25),
      borderRadius: 5,
      flexDirection: "column",
      padding: 5,
    },
    cardTracklistEntryOther: {
      position: "absolute",
      width: "100%",
      height: "100%",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-end",
      padding: 5,
    },

    webview: {
      display: "none",
      width: 0,
      height: 0,
      opacity: 0,
    },
    secondaryText: {
      opacity: 0.6,
    },
  });

  React.useEffect(() => {
    getSongData(song.service, song.type, song.id)
      .then((x) => {
        RN.LayoutAnimation.configureNext({ duration: 500 });
        setSongData(x ?? false);
      })
      .catch(
        (e) => (
          showToast(`${e}`, getAssetIDByName("Small")), setSongData(false)
        )
      );
  }, []);

  const cover =
    songData &&
    songData.coverArt.sources.sort(
      (a, b) => a.width * a.height - b.width * b.height
    )[0];

  return songData !== false && songData ? (
    <>
      <View style={styles.card} pointerEvents="box-none">
        <View
          style={[
            styles.cardFirst,
            songData.type === "album" && { height: "40%" },
          ]}
        >
          <View style={styles.cardFirstContent}>
            <RN.Image style={styles.cardImage} source={{ uri: cover.url }} />
            <View style={styles.cardContent}>
              <SimpleText
                variant="text-sm/bold"
                color="TEXT_NORMAL"
                lineClamp={1}
              >
                {songData.title}
              </SimpleText>
              {songData.type === "track" ? (
                <View style={styles.cardContentArtist}>
                  {songData.isExplicit && (
                    <SimpleText
                      variant="text-xs/semibold"
                      color="BLACK"
                      style={styles.cardContentTag}
                    >
                      E
                    </SimpleText>
                  )}
                  <SimpleText
                    variant="text-xs/semibold"
                    color="TEXT_NORMAL"
                    lineClamp={1}
                  >
                    {songData.artists.map((x, i, a) => (
                      <>
                        {x.name}
                        {i !== a.length - 1 && ", "}
                      </>
                    ))}
                  </SimpleText>
                </View>
              ) : (
                <SimpleText
                  variant="text-xs/semibold"
                  color="TEXT_NORMAL"
                  style={styles.secondaryText}
                  lineClamp={1}
                >
                  {songData.subtitle}
                </SimpleText>
              )}
            </View>
          </View>
          <View style={styles.cardOther}>
            <RN.TouchableOpacity
              onPress={() =>
                openSheet(SongInfoSheet, { song, showAdd, remove })
              }
            >
              <RN.Image source={getAssetIDByName("ic_feed_more")} />
            </RN.TouchableOpacity>
            <RN.TouchableOpacity onPress={() => setPlaying(!playing)}>
              <SvgXml width={30} height={30} xml={playing ? pause : play} />
            </RN.TouchableOpacity>
          </View>
        </View>
        {songData.type === "album" && (
          <RN.FlatList
            nestedScrollEnabled={true}
            style={styles.cardTracklist}
            data={songData.trackList}
            ListHeaderComponent={() => <View style={{ height: 8 }} />}
            ListFooterComponent={() => <View style={{ height: 8 }} />}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item, index }) => (
              <RN.Pressable
                style={styles.cardTracklistEntry}
                onPress={() => {
                  setPosition(index);
                  setPlaying(true);
                }}
              >
                <SimpleText
                  variant={
                    position === index ? "text-sm/bold" : "text-sm/semibold"
                  }
                  color="TEXT_NORMAL"
                  lineClamp={1}
                >
                  {item.title}
                </SimpleText>
                <View style={styles.cardContentArtist}>
                  {item.isExplicit && (
                    <SimpleText
                      variant="text-xs/semibold"
                      color="BLACK"
                      style={styles.cardContentTag}
                    >
                      E
                    </SimpleText>
                  )}
                  <SimpleText
                    variant="text-sm/semibold"
                    color="TEXT_NORMAL"
                    style={styles.secondaryText}
                    lineClamp={1}
                  >
                    {item.subtitle}
                  </SimpleText>
                </View>
                <View style={styles.cardTracklistEntryOther}>
                  <RN.TouchableOpacity
                    onPress={() =>
                      openSheet(SongInfoSheet, {
                        song: {
                          service: "spotify",
                          id: item.uid,
                          type: "track",
                        },
                        showAdd,
                      })
                    }
                  >
                    <RN.Image source={getAssetIDByName("ic_feed_more")} />
                  </RN.TouchableOpacity>
                </View>
              </RN.Pressable>
            )}
          />
        )}
      </View>
      {songData.isPlayable && (
        <WebView
          source={{
            html: spotifyAudioWebView.replace(
              /AUDIOS_VARIABLE/g,
              JSON.stringify(
                songData.type === "track"
                  ? [songData.audioPreview.url]
                  : songData.trackList.map((x) => x.audioPreview.url)
              )
            ),
          }}
          style={styles.webview}
          mediaPlaybackRequiresUserAction={false}
          onMessage={({ nativeEvent: { data } }) => {
            if (data === "ended") {
              setPlaying(false);

              if (songData.type === "album") {
                const nextPos = position + 1;
                if (nextPos < songData.trackList.length) {
                  setPosition(nextPos);
                  setPlaying(true);
                } else setPosition(0);
              }
            }
          }}
          ref={audioWebviewRef}
          pointerEvents="none"
        />
      )}
    </>
  ) : (
    <View style={styles.emptyCard}>
      <RN.ActivityIndicator size="large" style={{ flex: 1 }} />
    </View>
  );
};

export default function ({ userId, you }: { userId: string; you: boolean }) {
  const [songs, setSongs] = React.useState<API.Song[] | undefined>(undefined);

  const youId = UserStore.getCurrentUser().id;

  React.useEffect(() => {
    if (youId === userId && cache.data) setSongs(cache.data.songs);
    else
      getProfileData(userId)
        .then((x) => setSongs(x?.songs ?? []))
        .catch(
          (e) => (showToast(`${e}`, getAssetIDByName("Small")), setSongs([]))
        );
  }, []);

  const hide = songs && !songs.filter((x) => !!x).length;

  const content = songs ? (
    songs.map((x, i) =>
      x
        ? x.service === "spotify" && (
            <SpotifySongEmbed
              song={x}
              showAdd={userId !== youId && !!currentAuthorization()}
              remove={
                userId === youId &&
                (() => {
                  const songs = cache.data?.songs;
                  if (!songs) return;

                  songs[i] = null;
                  check();
                })
              }
            />
          )
        : null
    )
  ) : (
    <RN.ActivityIndicator size="small" style={{ flex: 1 }} />
  );

  return !hide && you ? (
    <YouScreenProfileCard>
      <TableRowGroupTitle title="Song Spotlight" />
      <View style={{ flexDirection: "column", gap: 8, marginTop: 4 }}>
        {content}
      </View>
    </YouScreenProfileCard>
  ) : (
    <UserProfileSection title="Song Spotlight" showContainer={true}>
      <View
        style={{
          flexDirection: "column",
          gap: 8,
          paddingHorizontal: 8,
          paddingVertical: 8,
        }}
      >
        {content}
      </View>
    </UserProfileSection>
  );
}
