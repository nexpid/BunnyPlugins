import webview from "../../assets/webview.css";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { API } from "../types/api";
import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { currentAuthorization, getProfileData } from "../stuff/api";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { semanticColors } from "@vendetta/ui";
import { cache } from "..";

const { View } = General;

const UserProfileSection = findByName("UserProfileSection");
const WebView = findByName("WebView") ?? findByProps("WebView").default.render;

const UserStore = findByStoreName("UserStore");

const spotifyLink = (a: string, b: string) =>
  `https://open.spotify.com/embed/${a}/${b}`;

const SpotifyWebView = ({ link, ratio }: { link: string; ratio?: number }) => {
  const styles = stylesheet.createThemedStyleSheet({
    card: {
      width: "100%",
      aspectRatio: ratio,
      backgroundColor: semanticColors.BG_MOD_FAINT,
      borderRadius: 12,
    },
    view: {
      width: "100%",
      height: "100%",
      backgroundColor: "transparent",
    },
  });

  return (
    <View style={styles.card}>
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        <RN.ActivityIndicator size="large" style={{ flex: 1 }} />
      </View>
      <WebView
        source={{ uri: link }}
        style={styles.view}
        injectedJavaScript={`(() => {
          const e = document.createElement("style");
          e.setAttribute("type", "text/css");
          e.appendChild(
            document.createTextNode(${JSON.stringify(webview)})
          );
          document.head.appendChild(e);

          // document.addEventListener("click", (ev) => {
          //   if (ev.target.parentNode.parentNode?.classList.contains("OverflowMenuButton_overflowMenuButton___LEgN")) {
          //     window.ReactNativeWebView.postMessage('sheet');
          //   }
          // });
        })();`}
      />
    </View>
  );
};

export default function ({ userId }: { userId: string }) {
  const [songs, setSongs] = React.useState<API.Song[] | undefined>(undefined);

  React.useEffect(() => {
    if (!currentAuthorization()) return setSongs([]);

    if (UserStore.getCurrentUser().id === userId && cache.data)
      setSongs(cache.data.songs);
    else
      getProfileData(userId)
        .then((x) => setSongs(x?.songs ?? []))
        .catch(
          (e) => (showToast(`${e}`, getAssetIDByName("Small")), setSongs([]))
        );
  }, []);

  const hide = songs && !songs.filter((x) => !!x).length;

  return (
    !hide && (
      <UserProfileSection title="Song Spotlight" showContainer={true}>
        <View
          style={{
            flexDirection: "column",
            gap: 8,
            paddingHorizontal: 8,
            paddingVertical: 8,
          }}
        >
          {songs ? (
            songs
              .filter((x) => !!x)
              .map(
                (x) =>
                  x.service === "spotify" && (
                    <SpotifyWebView
                      link={spotifyLink(x.type, x.id)}
                      //   ratio={x.type === "track" ? 600 / 152 : 600 / (152 * 4)}
                      ratio={600 / 152}
                    />
                  )
              )
          ) : (
            <RN.ActivityIndicator size="small" style={{ flex: 1 }} />
          )}
        </View>
      </UserProfileSection>
    )
  );
}
