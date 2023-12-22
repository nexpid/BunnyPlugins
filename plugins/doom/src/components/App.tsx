import { findByProps } from "@vendetta/metro";
import {
  NavigationNative,
  React,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { SimpleText, SuperAwesomeIcon, WebView } from "../../../../stuff/types";
import webviewCss from "../../assets/webview.css";
import webviewHtml from "../../assets/webview.html";
import {
  downloadSource,
  existsFile,
  readFile,
  saveFile,
  toDownload,
  ToDownloadContent,
  toDownloadMimes,
} from "../stuff/files";

const { View } = General;
const Orientation = findByProps("OrientationType", "useOrientation");

export default function App() {
  const { width: _width, height: _height } = RN.Dimensions.get("window");

  const navigation = NavigationNative.useNavigation();

  const isLandscape = Orientation.useOrientation() === 1;
  const { width } = React.useRef({
    width: isLandscape ? _height : _width,
    height: isLandscape ? _width : _height,
  }).current;

  const [fetchedFiles, setFetchedFiles] =
    React.useState<ToDownloadContent | null>(null);
  const [downloadedFiles, setDownloadedFiles] = React.useState<
    typeof toDownload | null
  >(null);
  const isReady = downloadedFiles
    ? downloadedFiles.length >= toDownload.length
    : null;

  const downloaderController = React.useRef<AbortController>(null);
  React.useEffect(() => {
    if (downloadedFiles === null) {
      const all = Promise.all(toDownload.map((x) => existsFile(x)));
      all.then((results) => {
        setDownloadedFiles(
          results.map((_, i) => toDownload[i]).filter((_, i) => results[i]),
        );
      });
    } else {
      const shouldDownloadindex = toDownload.findIndex(
        (x) => !downloadedFiles.includes(x),
      );
      if (shouldDownloadindex === -1) return;
      const shouldDownload = toDownload[shouldDownloadindex];

      downloaderController.current?.abort();
      const controller = new AbortController();
      downloaderController.current = controller;
      fetch(downloadSource + shouldDownload, { signal: controller.signal })
        .then((res) =>
          res
            .blob()
            .then((blob) => {
              const reader = new FileReader();
              reader.addEventListener("error", () =>
                showToast(
                  `Failed to read ${shouldDownload}!`,
                  getAssetIDByName("Small"),
                ),
              );
              reader.addEventListener("load", () => {
                const splitter = ";base64,";
                const aResult = reader.result.toString().split(splitter);
                const result = `data:${
                  toDownloadMimes[shouldDownloadindex]
                };base64,${aResult.slice(1).join(splitter)}`;

                saveFile(shouldDownload, result.toString())
                  .then(() =>
                    setDownloadedFiles([...downloadedFiles, shouldDownload]),
                  )
                  .catch(() =>
                    showToast(
                      `Failed to save ${shouldDownload}!`,
                      getAssetIDByName("Small"),
                    ),
                  );
              });
              reader.readAsDataURL(blob);
            })
            .catch(() =>
              showToast(
                `Failed to parse ${shouldDownload}!`,
                getAssetIDByName("Small"),
              ),
            ),
        )
        .catch(() =>
          showToast(
            `Failed to download ${shouldDownload}!`,
            getAssetIDByName("Small"),
          ),
        );
    }
  }, [downloadedFiles]);

  React.useEffect(() => {
    if (
      !downloadedFiles ||
      downloadedFiles.length < toDownload.length ||
      fetchedFiles
    )
      return;

    const contents = Promise.all(downloadedFiles.map((x) => readFile(x)));
    contents
      .then((results) => {
        const entries = results.map((res, i) => [downloadedFiles[i], res]);
        setFetchedFiles(Object.fromEntries(entries));
      })
      .catch(() =>
        showToast("Failed to fetch contents!", getAssetIDByName("Small")),
      );
  }, [downloadedFiles]);

  const fadeValue = React.useRef(new RN.Animated.Value(1)).current;
  const fadeTimeoutRef = React.useRef(0);

  React.useEffect(() => {
    fadeTimeoutRef.current = setTimeout(
      () =>
        RN.Animated.timing(fadeValue, {
          toValue: 0.05,
          duration: 250,
          easing: RN.Easing.linear,
          useNativeDriver: true,
        }).start(),
      1_500,
    );
  }, []);

  const headerRightCallback = React.useRef(null);
  headerRightCallback.current = () => {
    if (!fetchedFiles && !downloadedFiles) return;
    setFetchedFiles(null);
    setDownloadedFiles([]);
  };

  const unsub = navigation.addListener("focus", () => {
    unsub();
    navigation.setOptions({
      headerRight: () => (
        <SuperAwesomeIcon
          onPress={() => headerRightCallback.current()}
          icon={getAssetIDByName("ic_message_delete")}
          style="header"
        />
      ),
    });
  });

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      backgroundColor: "#000",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    webview: {
      backgroundColor: semanticColors.BG_MOD_SUBTLE,
      overflow: "hidden",
      borderRadius: 2,
      aspectRatio: 1442.8 / 901.75,
    },
    webviewPortrait: {
      height: width,
      transform: [
        {
          rotate: "90deg",
        },
      ],
    },
    webviewLandscape: {
      height: "100%",
    },

    webviewUnder: {
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: 4,
      flex: 1,
    },

    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 2147483647,
    },
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.webview,
          isLandscape ? styles.webviewLandscape : styles.webviewPortrait,
        ]}
      >
        {fetchedFiles ? (
          <WebView
            source={{
              html: webviewHtml
                .replace(/REP_WEBVIEW_CSS/g, JSON.stringify(webviewCss))
                .replace(
                  /URL_JSDOS_JS/g,
                  JSON.stringify(fetchedFiles["js-dos.js"]).slice(1, -1),
                )
                .replace(
                  /URL_JSDOS_CSS/g,
                  JSON.stringify(fetchedFiles["js-dos.css"]).slice(1, -1),
                )
                .replace(
                  /URL_JSDOS_DOOM_LINK/g,
                  JSON.stringify(fetchedFiles["doom.jsdos"]),
                )
                .replace(
                  /URL_JSDOS_WDOSBOX_JS/g,
                  JSON.stringify(fetchedFiles["wdosbox.js"]),
                )
                .replace(
                  /URL_JSDOS_WDOSBOX_WASM/g,
                  JSON.stringify(fetchedFiles["wdosbox.wasm"]),
                ),
              baseUrl: "https://localhost",
            }}
            style={{ width: "100%", height: "100%", backgroundColor: "#0000" }}
          />
        ) : (
          <View style={styles.webviewUnder}>
            {isReady === null ? (
              <>
                <SimpleText variant="text-lg/semibold" color="WHITE">
                  Checking files...
                </SimpleText>
              </>
            ) : isReady ? (
              <>
                <SimpleText variant="text-lg/semibold" color="WHITE">
                  Reading files...
                </SimpleText>
              </>
            ) : (
              <>
                <SimpleText
                  variant="text-lg/semibold"
                  color="WHITE"
                  align="center"
                >
                  Downloading files ({downloadedFiles.length + 1}/
                  {toDownload.length}){"\n"}
                  {toDownload[downloadedFiles.length] ?? "-"}
                </SimpleText>
                <SimpleText variant="text-md/normal" color="WHITE">
                  This should only happen once
                </SimpleText>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
