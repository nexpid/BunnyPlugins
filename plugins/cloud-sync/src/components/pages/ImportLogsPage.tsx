import {
  constants,
  React,
  ReactNative as RN,
  stylesheet,
} from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";

import { lang } from "../..";

export let isInPage = false;

let logged: () => void;
const logs = [];
export function clearLogs() {
  logs.length = 0;
  logged?.();
}
export function addLog(scope: keyof typeof logScopes, message: string) {
  logs.push([scope, message]);
  logged?.();
}

const logScopes = {
  themes: "#42f5a4",
  plugins: "#4290f5",
  importer: "#e6f542",
};

const styles = stylesheet.createThemedStyleSheet({
  text: {
    fontFamily: constants.Fonts.CODE_SEMIBOLD || constants.Fonts.CODE_NORMAL,
    includeFontPadding: false,
    color: semanticColors.TEXT_NORMAL,

    marginHorizontal: 12,
    marginTop: 24,
  },
});

export const ImportLogsPage = () => {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  logged = forceUpdate;

  const scroller = React.useRef<import("react-native").ScrollView>();

  React.useEffect(() => {
    isInPage = true;
    return () => {
      isInPage = false;
    };
  }, []);

  return (
    <RN.ScrollView
      style={{ flex: 1 }}
      ref={scroller}
      onContentSizeChange={() =>
        scroller.current.scrollToEnd({ animated: true })
      }
    >
      <RN.Text style={styles.text}>
        {logs.map(([scope, message]) => [
          <RN.Text
            style={[
              styles.text,
              {
                color: logScopes[scope],
              },
            ]}
          >
            [{lang.format(`log.${scope as keyof typeof logScopes}`, {})}]:
          </RN.Text>,
          ` ${message}\n`,
        ])}
      </RN.Text>
    </RN.ScrollView>
  );
};

export function openImportLogsPage(navigation: any) {
  navigation.push("VendettaCustomPage", {
    render: ImportLogsPage,
    title: lang.format("page.import_logs", {}),
  });
}
