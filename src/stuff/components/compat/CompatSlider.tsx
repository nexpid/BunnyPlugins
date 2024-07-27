import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { type View } from "react-native";

import { Reanimated } from "$/deps";
import { resolveCustomSemantic } from "$/types";

import SliderIcon from "../SliderIcon";

export default function CompatSlider({
    value,
    step,
    onValueChange,
    minimumValue,
    maximumValue,
}: {
    value: number;
    step: number;
    onValueChange?: (val: number) => void;
    minimumValue: number;
    maximumValue: number;
}) {
    const [pressing, setPressing] = React.useState(false);
    const theBar = React.useRef<View>(null);

    const dotScale = Reanimated.useSharedValue(14);
    const shadowClr = Reanimated.useSharedValue("#00000000");

    const liveValue = React.useRef(value);
    liveValue.current = value;

    const start = (
        <SliderIcon
            side="start"
            onPress={() => {
                const val = Math.min(
                    Math.max(value - step, minimumValue),
                    maximumValue,
                );
                if (val !== value) onValueChange(val);
            }}
        />
    );
    const end = (
        <SliderIcon
            side="end"
            onPress={() => {
                const val = Math.min(
                    Math.max(value + step, minimumValue),
                    maximumValue,
                );
                if (val !== value) onValueChange(val);
            }}
        />
    );

    const styles = stylesheet.createThemedStyleSheet({
        base: {
            flexDirection: "row",
            alignItems: "center",
            height: 24,
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 12,
        },
        theBar: {
            // TODO make this not forced
            width: "70%",
            marginHorizontal: 16,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
        },
        bar: {
            width: "100%",
            height: 2,
            backgroundColor: resolveCustomSemantic("#ffffff0d", "#00000010"),
        },
        fullBar: {
            height: "100%",
            backgroundColor: "#5865f2",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
        },
        dot: {
            borderRadius: 11,
            backgroundColor: "#c9cdfb",
        },
        dotShadow: {
            width: 35,
            height: 35,
            transform: [{ translateX: 17.5 }],
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
        },
    });

    const pan = React.useRef(
        RN.PanResponder.create({
            onMoveShouldSetPanResponder() {
                return true;
            },
            onMoveShouldSetPanResponderCapture() {
                return true;
            },
            onStartShouldSetPanResponder() {
                return true;
            },
            onStartShouldSetPanResponderCapture() {
                return true;
            },
            onShouldBlockNativeResponder() {
                return true;
            },

            onPanResponderMove(_, gesture) {
                if (!theBar.current || gesture.moveX === 0) return;

                theBar.current.measure((_, __, width, ___, x) => {
                    const endX = x + width;
                    const perc = (gesture.moveX - x) / (endX - x);

                    const val =
            Math.round(
                Math.min(
                    Math.max(perc * maximumValue, minimumValue),
                    maximumValue,
                ) / step,
            ) * step;

                    if (val !== liveValue.current && gesture.moveX !== 0) {
                        setPressing(true);
                        onValueChange(val);
                    }
                });
            },
            onPanResponderEnd() {
                setPressing(false);
            },
        }),
    ).current;

    React.useEffect(() => {
        dotScale.value = Reanimated.withTiming(pressing ? 21 : 14, {
            duration: 100,
        });
        shadowClr.value = Reanimated.withTiming(
            pressing ? "#0000002a" : "#00000000",
            { duration: 100 },
        );
    }, [pressing]);

    return (
        <RN.View style={styles.base}>
            <RN.View style={{ marginRight: 8 }}>{start}</RN.View>
            <RN.View ref={theBar} style={styles.theBar} {...pan.panHandlers}>
                <RN.View style={styles.bar}>
                    <Reanimated.default.View
                        style={[
                            styles.fullBar,
                            {
                                width:
                  Math.min(
                      Math.max(
                          ((value - minimumValue) / (maximumValue - minimumValue)) *
                        100,
                          0,
                      ),
                      100,
                  ) + "%",
                            } as any,
                        ]}
                    >
                        <Reanimated.default.View
                            style={[
                                styles.dotShadow,
                                {
                                    backgroundColor: shadowClr,
                                },
                            ]}
                        >
                            <Reanimated.default.View
                                style={[
                                    styles.dot,
                                    {
                                        width: dotScale,
                                        height: dotScale,
                                    },
                                ]}
                            ></Reanimated.default.View>
                        </Reanimated.default.View>
                    </Reanimated.default.View>
                </RN.View>
            </RN.View>
            <RN.View style={{ marginLeft: 8 }}>{end}</RN.View>
        </RN.View>
    );
}
