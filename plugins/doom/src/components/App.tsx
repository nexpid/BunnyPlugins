import webview from "../../assets/webview.css";
import { stylesheet, React, ReactNative as RN } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import { SimpleText, WebView } from "../../../../stuff/types";
import { semanticColors } from "@vendetta/ui";

const { View } = General;

export default function App() {
  const width = RN.Dimensions.get("screen").width;

  const [isLoaded, setIsloaded] = React.useState(false);

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
  });

  return (
    <View style={styles.container}>
      <View style={styles.webview}>
        <View style={styles.webviewUnder}>
          <SimpleText variant="text-lg/semibold" style={{ color: "#fff" }}>
            doom is loading...
          </SimpleText>
          <SimpleText variant="text-md/normal" style={{ color: "#fff" }}>
            FLIP YOUR PHONE SIDEWAYS!!!
          </SimpleText>
        </View>
        <WebView
          source={{
            uri: "https://dos.zone/doom-dec-1993/",
          }}
          style={[
            { width: "100%", height: "100%" },
            !isLoaded && { display: "none" },
          ]}
          injectedJavaScript={`(() => {
                const done = { clicker: false, clickity: 0, root: false, last: false };
                const int = setInterval(() => {
                    if (done.last) {
                        clearInterval(int);
                        return window.ReactNativeWebView.postMessage("loaded");
                    }

                    const clicker = document.querySelector(".pre-run");
                    if (clicker && !done.clicker) {
                        done.clicker = true;
                        clicker.click();
                    }

                    const clickity = document.querySelector("div.flex.flex-row.justify-center.mt-2:has(p.uppercase.cursor-pointer)");
                    if (clickity && done.clickity < 5) {
                        done.clickity++;
                        clickity.click();
                    }

                    const root = document.querySelector("div.emulator-root");
                    if (root && !done.root) {
                        done.root = true;

                        const style = document.createElement("style");
                        style.setAttribute("type", "text/css");
                        style.appendChild(document.createTextNode(${JSON.stringify(
                          webview
                        )}));
                        document.head.appendChild(style);

                        setTimeout(() => {
                            done.last = true;

                            document.body.appendChild(root);
                            const special = document.querySelector("body link");
                            Array.from(document.body.children).forEach(x => (x !== root && x !== special) && x.remove());
                        }, 1000);
                    }
                }, 10);
            })()`}
          onMessage={({ nativeEvent: { data } }) =>
            data === "loaded" && setIsloaded(true)
          }
        />
      </View>
    </View>
  );
}
