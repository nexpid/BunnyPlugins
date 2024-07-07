import { logger } from "@vendetta";
import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { ActionSheet } from "$/components/ActionSheet";
import Text from "$/components/Text";
import { Svg, WebView } from "$/deps";
import { lerp, resolveCustomSemantic, TextStyleSheet } from "$/types";

import next from "../../assets/card/next.svg";
import pause from "../../assets/card/pause.svg";
import play from "../../assets/card/play.svg";
import spotifyAudioWebView from "../../assets/card/spotifyAudioWebView.html";
import { cache } from "..";
import { currentAuthorization, getProfileData } from "../stuff/api";
import { check } from "../stuff/http";
import {
  getSongData,
  SpotifyEmbedEntity,
  SpotifyEmbedEntityTracklistEntry,
} from "../stuff/songs";
import { API } from "../types/api";
import SongInfoSheet from "./sheets/SongInfoSheet";

const { View } = General;
const AnimatedPressable = RN.Animated.createAnimatedComponent(RN.Pressable);

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
    undefined,
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
      })})`,
    );
  }, [playing, position]);

  playingRn.set(skey, () => setPlaying(false));
  React.useEffect(
    () => () => {
      playingRn.delete(skey);
    },
    [],
  );

  const background =
    songData &&
    (songData.coverArt.extractedColors.colorLight
      ? resolveCustomSemantic(
          songData.coverArt.extractedColors.colorDark.hex,
          songData.coverArt.extractedColors.colorLight.hex,
        )
      : songData.coverArt.extractedColors.colorDark.hex);

  const styles = stylesheet.createThemedStyleSheet({
    emptyCard: {
      width: "100%",
      aspectRatio: ratio,
      backgroundColor: semanticColors.BG_MOD_FAINT,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    noImage: {
      tintColor: semanticColors.TEXT_DANGER,
      width: 36,
      height: 36,
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
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 4,
      color: "#000000",
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
    cardOtherBottom: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
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
      padding: 8,
      flexGrow: 0,
      flexShrink: 0,
    },
    cardTracklistEntryUnplayable: {
      backgroundColor: background && lerp(background, "#000000", 0.2),
    },
    cardTracklistEntryPlaying: {
      backgroundColor: background && lerp(background, "#000000", 0.35),
    },
    cardTracklistEntryTitle: {
      width: "95%",
      color: "#ffffff",
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
      opacity: 0.7,
      color: "#ffffff",
    },
    unplayableItem: {
      opacity: 0.5,
    },
    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 2147483647,
    } as any,
    androidRippleTwo: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 8,
    } as any,
  });

  const triggerController = React.useRef(null);

  const trigger = () => {
    triggerController.current?.abort();
    const controller = new AbortController();
    triggerController.current = controller;

    setSongData(undefined);
    getSongData(song.service, song.type, song.id, controller.signal)
      .then((x) => {
        const res = x ?? false;
        if (res && res.type !== "track")
          res.trackList = res.trackList.slice(0, 50);

        setSongData(res);
      })
      .catch(
        (e) =>
          e?.name !== "AbortError" &&
          (console.error(`[SongSpotlight] Failed to get song data!`),
          logger.error(`Failed to get song data!\n${e.stack}`),
          showToast("Failed to get song data!", getAssetIDByName("Small")),
          setSongData(false)),
      );
  };
  React.useEffect(() => {
    trigger();
    return () => triggerController.current?.abort();
  }, []);

  const covers = songData && songData.coverArt.sources;

  const tracklistRef = React.useRef<import("react-native").FlatList>();

  React.useEffect(() => {
    tracklistRef.current?.scrollToIndex({
      animated: true,
      index: position,
      viewOffset: 16,
    });
  }, [position]);

  const TracklistEntry = ({
    item,
    selected,
    playable,
    jump,
    more,
  }: {
    item: SpotifyEmbedEntityTracklistEntry;
    selected: boolean;
    playable: boolean;
    jump: () => void;
    more: () => void;
  }) => {
    return (
      <AnimatedPressable
        android_ripple={styles.androidRippleTwo}
        style={[
          styles.cardTracklistEntry,
          !playable && styles.cardTracklistEntryUnplayable,
          selected && styles.cardTracklistEntryPlaying,
        ]}
        onPress={jump}
        onLongPress={more}
      >
        <Text
          style={[
            styles.cardTracklistEntryTitle,
            !playable && styles.unplayableItem,
          ]}
          variant={selected ? "text-sm/bold" : "text-sm/semibold"}
          lineClamp={1}
        >
          {item.title}
        </Text>
        <View style={styles.cardContentArtist}>
          {item.isExplicit && (
            <Text
              variant="text-xs/semibold"
              style={[
                styles.cardContentTag,
                !playable && styles.unplayableItem,
              ]}
            >
              E
            </Text>
          )}
          <Text
            variant={selected ? "text-xs/bold" : "text-xs/semibold"}
            style={[styles.secondaryText, !playable && styles.unplayableItem]}
            lineClamp={1}
          >
            {item.subtitle}
          </Text>
        </View>
        <View style={styles.cardTracklistEntryOther}>
          <RN.Pressable android_ripple={styles.androidRipple} onPress={more}>
            <RN.Image source={getAssetIDByName("ic_feed_more")} />
          </RN.Pressable>
        </View>
      </AnimatedPressable>
    );
  };

  const trackPlayable =
    songData && songData.type === "track"
      ? songData.isPlayable && !!songData.audioPreview?.url
      : true;

  const entryHeight =
    8 * 2 +
    TextStyleSheet["text-sm/normal"].lineHeight +
    TextStyleSheet["text-xs/normal"].lineHeight +
    1.4;

  return songData ? (
    <>
      <View style={styles.card} pointerEvents="box-none">
        <View
          style={[
            styles.cardFirst,
            songData.type !== "track" && { height: "40%" },
          ]}
        >
          <View style={styles.cardFirstContent}>
            <RN.Image
              style={styles.cardImage}
              source={covers
                .sort((a, b) => a.width - b.width)
                .map((x) => ({
                  uri: x.url,
                  width: x.width,
                  height: x.height,
                }))}
            />
            <View style={styles.cardContent}>
              <Text
                variant="text-sm/bold"
                style={{ color: "#ffffff" }}
                lineClamp={1}
              >
                {songData.title}
              </Text>
              {songData.type === "track" ? (
                <View style={styles.cardContentArtist}>
                  {songData.isExplicit && (
                    <Text
                      variant="text-xs/semibold"
                      style={styles.cardContentTag}
                    >
                      E
                    </Text>
                  )}
                  <Text
                    variant="text-xs/semibold"
                    style={styles.secondaryText}
                    lineClamp={1}
                  >
                    {songData.artists.map((x) => x.name).join(", ")}
                  </Text>
                </View>
              ) : (
                <Text
                  variant="text-xs/semibold"
                  style={[styles.secondaryText, { color: "#ffffff" }]}
                  lineClamp={1}
                >
                  {songData.subtitle}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.cardOther}>
            <RN.Pressable
              android_ripple={styles.androidRipple}
              onPress={() =>
                ActionSheet.open(SongInfoSheet, { song, showAdd, remove })
              }
            >
              <RN.Image source={getAssetIDByName("ic_feed_more")} />
            </RN.Pressable>
            <View style={styles.cardOtherBottom}>
              <RN.Pressable
                android_ripple={styles.androidRipple}
                onPress={() => setPlaying(!playing)}
                style={!trackPlayable && styles.unplayableItem}
              >
                <Svg.SvgXml
                  width={30}
                  height={30}
                  xml={playing ? pause : play}
                />
              </RN.Pressable>
              {songData.type !== "track" && (
                <RN.Pressable
                  android_ripple={styles.androidRipple}
                  onPress={() => {
                    setPlaying(false);
                    const nextPos = position + 1;
                    if (nextPos < songData.trackList.length) {
                      const item = songData.trackList[nextPos];
                      if (item.isPlayable && !!item.audioPreview?.url) {
                        setPosition(nextPos);
                        setPlaying(true);
                      } else {
                        const nextIndex = songData.trackList.findIndex(
                          (x, i) =>
                            i > nextPos &&
                            x.isPlayable &&
                            !!x.audioPreview?.url,
                        );
                        if (nextIndex !== -1) {
                          setPosition(nextIndex);
                          setPlaying(true);
                        }
                        showToast("The next song cannot be played");
                      }
                    } else setPosition(0);
                  }}
                >
                  <Svg.SvgXml width={20} height={20} xml={next} />
                </RN.Pressable>
              )}
            </View>
          </View>
        </View>
        {songData.type !== "track" && (
          <RN.FlatList
            nestedScrollEnabled
            ref={tracklistRef}
            getItemLayout={(_, index) => ({
              length: entryHeight,
              offset: 8 * (index + 1) + entryHeight * index,
              index,
            })}
            style={styles.cardTracklist}
            data={songData.trackList}
            ListHeaderComponent={() => <View style={{ height: 8 }} />}
            ListFooterComponent={() => <View style={{ height: 8 }} />}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item, index }) => {
              const playable = item.isPlayable && !!item.audioPreview?.url;
              return (
                <TracklistEntry
                  item={item}
                  selected={index === position}
                  playable={playable}
                  jump={() => {
                    if (playable) {
                      setPosition(index);
                      setPlaying(true);
                    } else {
                      const nextIndex = songData.trackList.findIndex(
                        (x, i) =>
                          i > index && x.isPlayable && !!x.audioPreview?.url,
                      );
                      if (nextIndex !== -1) {
                        setPosition(nextIndex);
                        setPlaying(true);
                      }
                      return showToast("This song cannot be played");
                    }
                  }}
                  more={() =>
                    ActionSheet.open(SongInfoSheet, {
                      song: {
                        service: "spotify",
                        type: "track",
                        id: item.uid,
                      },
                      showAdd,
                    })
                  }
                />
              );
            }}
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
                  ? [songData.audioPreview?.url ?? null]
                  : songData.trackList.map((x) => x.audioPreview?.url ?? null),
              ),
            ),
          }}
          style={styles.webview}
          mediaPlaybackRequiresUserAction={false}
          onMessage={({ nativeEvent: { data } }) => {
            if (data === "ended") {
              setPlaying(false);

              if (songData.type !== "track") {
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
  ) : songData === false ? (
    <View style={styles.emptyCard}>
      <RN.Pressable android_ripple={styles.androidRipple} onPress={trigger}>
        <RN.Image
          style={styles.noImage}
          source={getAssetIDByName("ic_message_retry")}
          resizeMode="contain"
        />
      </RN.Pressable>
    </View>
  ) : (
    <View style={styles.emptyCard}>
      <RN.ActivityIndicator size="large" />
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
          (e) =>
            e?.name !== "AbortError" &&
            (console.error(`[SongSpotlight] Failed to get profile data!`),
            logger.error(`Failed to get profile data!\n${e.stack}`),
            showToast("Failed to get profile data!", getAssetIDByName("Small")),
            setSongs([])),
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
        : null,
    )
  ) : (
    <RN.ActivityIndicator size="small" style={{ flex: 1 }} />
  );

  return (
    !hide &&
    (you ? (
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
    ))
  );
}
