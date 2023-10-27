import webviewHtml from "../../assets/webview.html";
import webviewCss from "../../assets/webview.css";
import { stylesheet, React, ReactNative as RN } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import { SimpleText, WebView } from "../../../../stuff/types";
import { semanticColors } from "@vendetta/ui";
import {
  ToDownloadContent,
  downloadSource,
  existsFile,
  readFile,
  saveFile,
  toDownload,
  toDownloadMimes,
} from "../stuff/files";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { View } = General;

const AnimatedPressable = RN.Animated.createAnimatedComponent(RN.Pressable);

export default function App() {
  const width = RN.Dimensions.get("screen").width;

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
          results.map((_, i) => toDownload[i]).filter((_, i) => results[i])
        );
      });
    } else {
      const shouldDownloadindex = toDownload.findIndex(
        (x) => !downloadedFiles.includes(x)
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
                  getAssetIDByName("Small")
                )
              );
              reader.addEventListener("load", () => {
                const splitter = ";base64,";
                const aResult = reader.result.toString().split(splitter);
                const result = `data:${
                  toDownloadMimes[shouldDownloadindex]
                };base64,${aResult.slice(1).join(splitter)}`;

                saveFile(shouldDownload, result.toString())
                  .then(() =>
                    setDownloadedFiles([...downloadedFiles, shouldDownload])
                  )
                  .catch(() =>
                    showToast(
                      `Failed to save ${shouldDownload}!`,
                      getAssetIDByName("Small")
                    )
                  );
              });
              reader.readAsDataURL(blob);
            })
            .catch(() =>
              showToast(
                `Failed to parse ${shouldDownload}!`,
                getAssetIDByName("Small")
              )
            )
        )
        .catch(() =>
          showToast(
            `Failed to download ${shouldDownload}!`,
            getAssetIDByName("Small")
          )
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
        showToast("Failed to fetch contents!", getAssetIDByName("Small"))
      );
  }, [downloadedFiles]);

  const fadeValue = React.useRef(new RN.Animated.Value(0.05)).current;
  const fadeTimeoutRef = React.useRef(0);

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      backgroundColor: "#000",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    webview: {
      backgroundColor: semanticColors.BG_MOD_SUBTLE,
      height: width,
      aspectRatio: 1442.8 / 901.75,
      overflow: "hidden",
      borderRadius: 2,
      transform: [
        {
          rotate: "90deg",
        },
      ],
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

    buttonContainerMain: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
    },
    buttonContainer: {
      marginHorizontal: 24,
      marginVertical: 24,
    },
    button: {
      width: "100%",
      backgroundColor: semanticColors.BUTTON_OUTLINE_BRAND_BACKGROUND_ACTIVE,
      borderRadius: 2147483647,
    },

    androidRipple: {
      color: semanticColors.ANDROID_RIPPLE,
      cornerRadius: 2147483647,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.webview}>
        {fetchedFiles ? (
          <WebView
            source={{
              html: webviewHtml
                .replace(/REP_WEBVIEW_CSS/g, JSON.stringify(webviewCss))
                .replace(
                  /URL_JSDOS_JS/g,
                  JSON.stringify(fetchedFiles["js-dos.js"]).slice(1, -1)
                )
                .replace(
                  /URL_JSDOS_CSS/g,
                  JSON.stringify(fetchedFiles["js-dos.css"]).slice(1, -1)
                )
                .replace(
                  /URL_JSDOS_DOOM_LINK/g,
                  JSON.stringify(fetchedFiles["doom.jsdos"])
                )
                .replace(
                  /URL_JSDOS_WDOSBOX_JS/g,
                  JSON.stringify(fetchedFiles["wdosbox.js"])
                )
                .replace(
                  /URL_JSDOS_WDOSBOX_WASM/g,
                  JSON.stringify(fetchedFiles["wdosbox.wasm"])
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
                  Fetching files...
                </SimpleText>
              </>
            ) : (
              <>
                <SimpleText variant="text-lg/semibold" color="WHITE">
                  Downloading files ({downloadedFiles.length + 1}/
                  {toDownload.length})
                </SimpleText>
                <SimpleText variant="text-md/normal" color="WHITE">
                  This should only happen once
                </SimpleText>
              </>
            )}
          </View>
        )}
      </View>
      <View style={styles.buttonContainerMain}>
        <View style={styles.buttonContainer}>
          <AnimatedPressable
            style={[
              styles.button,
              {
                opacity: fadeValue,
              },
            ]}
            android_ripple={styles.androidRipple}
            onPressIn={() => {
              clearTimeout(fadeTimeoutRef.current);
              RN.Animated.timing(fadeValue, {
                toValue: 1,
                duration: 200,
                easing: RN.Easing.linear,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              fadeTimeoutRef.current = setTimeout(
                () =>
                  RN.Animated.timing(fadeValue, {
                    toValue: 0.05,
                    duration: 250,
                    easing: RN.Easing.linear,
                    useNativeDriver: true,
                  }).start(),
                1_500
              );
            }}
            onPress={() => {
              if (!fetchedFiles && !downloadedFiles) return;
              setFetchedFiles(null);
              setDownloadedFiles([]);
            }}
          >
            <SimpleText
              variant="text-md/medium"
              color="BUTTON_OUTLINE_BRAND_TEXT"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
              align="center"
            >
              Redownload Files
            </SimpleText>
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
}
