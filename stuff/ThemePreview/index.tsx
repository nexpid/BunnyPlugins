import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { ErrorBoundary, General } from "@vendetta/ui/components";
import Preview1 from "./previews/Preview1";
import { ThemePreviewData } from "./util";

export default function ({ theme: t }: { theme: ThemePreviewData }) {
  const dims = RN.Dimensions.get("window");
  const styles = stylesheet.createThemedStyleSheet({
    card: {
      width: dims.width * 0.6,
      height: dims.height * 0.6,
      borderRadius: 8,
      backgroundColor: semanticColors.BACKGROUND_SECONDARY_ALT,
      marginHorizontal: 8,
      overflow: "hidden",
    },
  });

  return (
    <ErrorBoundary>
      <Preview1 style={styles.card} theme={t} />
    </ErrorBoundary>
    /*<ScrollView
      horizontal={true}
      pagingEnabled={true}
      decelerationRate={0}
      snapToInterval={0}
      snapToAlignment="center"
      contentInset={{
        left: 10,
        right: 10,
        top: 0,
        bottom: 0,
      }}
      contentContainerStyle={{
        paddingHorizontal: RN.Platform.OS === "android" ? 10 : 0,
      }}
    >
      <ErrorBoundary>
        <Preview1 style={styles.card} theme={t} />
      </ErrorBoundary>
    </ScrollView>*/
  );
}
