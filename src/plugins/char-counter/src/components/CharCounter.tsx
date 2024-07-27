import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { semanticColors } from "@vendetta/ui";

import Text from "$/components/Text";
import { Reanimated } from "$/deps";
import { TextStyleSheet } from "$/types";

import { vstorage } from "..";
import getMessageLength, { display, hasSLM } from "../stuff/getMessageLength";
import { lastText } from "../stuff/patcher";

const xsFontSize = TextStyleSheet["text-xs/semibold"].fontSize;
const styles = stylesheet.createThemedStyleSheet({
    androidRipple: {
        color: semanticColors.ANDROID_RIPPLE,
        cornerRadius: 8,
    } as any,
    container: {
        backgroundColor: semanticColors.BACKGROUND_TERTIARY,
        borderRadius: 8,
        marginRight: 8,
        marginTop: -12,
    },
    text: {
        ...TextStyleSheet["text-xs/semibold"],
        textAlign: "right",
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    extraMessagesCircle: {
        backgroundColor: semanticColors.REDESIGN_BUTTON_PRIMARY_BACKGROUND,
        borderRadius: 2147483647,
        position: "absolute",
        left: 0,
        top: 0,
        transform: [
            {
                translateX: -xsFontSize,
            },
            {
                translateY: -xsFontSize,
            },
        ],
        minWidth: xsFontSize * 2,
        height: xsFontSize * 2,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },
});

export default ({ inputProps }: { inputProps: any }) => {
    const [isToggled, setIsToggled] = React.useState(false);
    const [text, setText] = React.useState("");

    const fade = Reanimated.useSharedValue(vstorage.minChars === 0 ? 1 : 0);
    const fadeExtra = Reanimated.useSharedValue(0);

    lastText.value = text;
    after(
        "onChangeText",
        inputProps,
        ([txt]: [string]) => {
            setText(txt);
        },
        true,
    );

    const curLength = text.length,
        maxLength = getMessageLength();
    const extraMessages = hasSLM() ? Math.floor(curLength / maxLength) : 0;
    const dspLength = curLength - extraMessages * maxLength;

    const elY =
        (styles.text as any).fontSize * 2 +
        (styles.text as any).paddingVertical;

    const shouldAppear = curLength >= (vstorage.minChars ?? 1);
    React.useEffect(() => {
        fade.value = Reanimated.withTiming(
            shouldAppear ? (isToggled ? 0.3 : 1) : 0,
            { duration: 100 },
        );
    }, [shouldAppear, isToggled]);

    React.useEffect(() => {
        fadeExtra.value = Reanimated.withTiming(extraMessages > 0 ? 1 : 0, {
            duration: 100,
        });
    }, [extraMessages]);

    return (
        <Reanimated.default.View
            style={[
                {
                    flexDirection: "row-reverse",
                    position: "absolute",
                    right: 0,
                    top: -elY,
                    zIndex: 1,
                },
                {
                    opacity: fade,
                },
            ]}>
            <RN.Pressable
                android_ripple={styles.androidRipple}
                style={styles.container}
                pointerEvents={shouldAppear ? "box-only" : "none"}
                onPress={
                    shouldAppear
                        ? () => {
                              setIsToggled(!isToggled);
                          }
                        : undefined
                }>
                <Reanimated.default.View
                    style={[
                        styles.extraMessagesCircle,
                        { opacity: fadeExtra },
                    ]}>
                    <Text
                        variant="text-xs/semibold"
                        color="TEXT_NORMAL"
                        style={{ paddingHorizontal: xsFontSize / 2 }}>
                        {extraMessages}
                    </Text>
                </Reanimated.default.View>
                <Text
                    variant="text-xs/semibold"
                    color={
                        dspLength <= maxLength ? "TEXT_NORMAL" : "TEXT_DANGER"
                    }
                    style={{
                        paddingHorizontal: 8,
                        paddingVertical: 8,
                    }}>
                    {display(dspLength)}
                </Text>
            </RN.Pressable>
        </Reanimated.default.View>
    );
};
