import { React } from "@vendetta/metro/common";

import { WebView } from "../../../../stuff/types";
import cryptoWebview from "../../assets/cryptoWebview.html";

type WVRes =
  | { tracker: string; data: string }
  | { tracker: string; error: string };
type WV = import("react-native-webview").WebView;

let handler: WV;
const handlers: Record<string, (ret: WVRes) => void> = {};

const makeTracker = () => Math.floor(Math.random() * 1e36).toString(36);
const sendMessage = (data: any) =>
  handler?.injectJavaScript(`window.postMessage(${JSON.stringify(data)})`);

export async function encrypt(
  data: string,
  key: string,
): Promise<string | null> {
  if (!handler) return null;

  const tracker = makeTracker();
  return new Promise((res, rej) => {
    handlers[tracker] = (r) => ("error" in r ? rej(r.error) : res(r.data));
    sendMessage({ action: "encrypt", data, key, tracker });
  });
}
export async function decrypt(
  data: string,
  key: string,
): Promise<string | null> {
  if (!handler) return null;

  const tracker = makeTracker();
  return new Promise((res, rej) => {
    handlers[tracker] = (r) => ("error" in r ? rej(r.error) : res(r.data));
    sendMessage({ action: "decrypt", data, key, tracker });
  });
}

export function CryptoWebViewHandler() {
  React.useEffect(() => () => (handler = undefined), []);

  return (
    <WebView
      ref={(e) => (handler = e)}
      source={{ html: cryptoWebview, baseUrl: "https://localhost" }}
      style={{ display: "none", opacity: 0 }}
      onMessage={({ nativeEvent: { data } }) => {
        let res: WVRes;
        try {
          res = JSON.parse(data);
        } catch {
          return;
        }

        handlers[res.tracker]?.(res);
      }}
    />
  );
}
