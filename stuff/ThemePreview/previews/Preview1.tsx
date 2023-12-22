import { ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";

import FakeText from "../FakeText";
import { semanticFromTheme, ThemePreviewData } from "../util";

const { View } = General;

export default function ({
  style,
  theme: t,
}: {
  style: any;
  theme: ThemePreviewData;
}) {
  const styles = stylesheet.createThemedStyleSheet({
    bottomCont: {
      flex: 1 / 5,
      justifyContent: "center",
      alignItems: "center",
    },
    bottomIcon: {
      height: "50%",
      aspectRatio: 1,
    },
    round: {
      aspectRatio: 1,
      borderRadius: 2147483647,
    },
    middle: {
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const guhIcon =
    "https://cdn.discordapp.com/attachments/919655852724604978/1129359052045025322/5b7f29e9c670fbcbf476b4d88fbd081f.png";

  const avis = [
    "clyde-avatar",
    "role_subscription_earning_metric_avatar",
    "role_subscription_benefit_avatar_1",
    "role_subscription_benefit_wise_avatar",
    "role_subscription_benefit_bunny_avatar",
    "role_subscription_benefit_nelly_avatar",
    "avatar_onboarding",
  ];
  const chat = [];
  for (const x of avis) {
    chat.push(
      <View style={{ marginBottom: 13, flexDirection: "row" }}>
        <RN.Image
          style={[
            styles.round,
            {
              marginRight: 8,
              width: "15%",
            },
          ]}
          source={getAssetIDByName(x)}
        ></RN.Image>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <FakeText
            size="sm"
            variant="semibold"
            color={semanticFromTheme(t, "TEXT_NORMAL")}
          >
            Random User
          </FakeText>
        </View>
      </View>,
    );
  }

  return (
    <View
      style={[
        style,
        { backgroundColor: semanticFromTheme(t, "BACKGROUND_TERTIARY") },
      ]}
    >
      <View
        style={{
          width: "20%",
          height: "100%",
          position: "absolute",
          left: 0,
          top: "4%",
          paddingHorizontal: 10,
          flexDirection: "column",
        }}
      >
        <View
          style={[
            styles.round,
            styles.middle,
            {
              borderRadius: 10,
              backgroundColor: semanticFromTheme(
                t,
                "BUTTON_OUTLINE_BRAND_BACKGROUND_HOVER",
              ),
              marginBottom: 8,
              width: "100%",
            },
          ]}
        >
          <RN.Image
            source={getAssetIDByName("ic_chat_bubble_16px")}
            style={[
              styles.bottomIcon,
              { tintColor: semanticFromTheme(t, "INTERACTIVE_ACTIVE") },
            ]}
          />
        </View>
        <View
          style={{
            width: "100%",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              height: 1,
              backgroundColor: semanticFromTheme(
                t,
                "BACKGROUND_MOBILE_SECONDARY",
              ),
            }}
          />
        </View>
        <RN.Image
          style={[styles.round, { marginBottom: 8, width: "100%" }]}
          source={{ uri: guhIcon }}
        />
        <View
          style={[
            styles.round,
            styles.middle,
            {
              backgroundColor: semanticFromTheme(t, "BACKGROUND_TERTIARY"),
              marginBottom: 8,
              width: "100%",
            },
          ]}
        >
          <RN.Image
            style={[
              styles.bottomIcon,
              {
                tintColor: semanticFromTheme(
                  t,
                  "BUTTON_OUTLINE_POSITIVE_BORDER",
                ),
              },
            ]}
            source={getAssetIDByName("hub-add")}
          />
        </View>
        <View
          style={[
            styles.round,
            styles.middle,
            {
              backgroundColor: semanticFromTheme(
                t,
                "BACKGROUND_MOBILE_SECONDARY",
              ),
              marginBottom: 8,
              width: "100%",
            },
          ]}
        >
          <RN.Image
            style={[
              styles.bottomIcon,
              {
                tintColor: semanticFromTheme(
                  t,
                  "BUTTON_OUTLINE_POSITIVE_BORDER",
                ),
              },
            ]}
            source={getAssetIDByName("hub-icon")}
          />
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          left: "20%",
          top: "4%",
          width: "80%",
          height: "100%",
          paddingRight: 10,
        }}
      >
        <View
          style={{
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            backgroundColor: semanticFromTheme(
              t,
              "BACKGROUND_MOBILE_SECONDARY",
            ),
            height: "100%",
            paddingHorizontal: 12,
            paddingVertical: 12,
          }}
        >
          <View
            style={{
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ paddingVertical: 6 }}>
              <FakeText
                size="md"
                variant="bold"
                color={semanticFromTheme(t, "TEXT_NORMAL")}
              >
                Direct Messages
              </FakeText>
            </View>
            <RN.Image
              style={{
                position: "absolute",
                right: 0,
                height: "80%",
                aspectRatio: 1,
                tintColor: semanticFromTheme(t, "HEADER_SECONDARY"),
              }}
              source={getAssetIDByName("ic-new-message")}
            />
          </View>
          <View
            style={{
              marginBottom: 14,
              backgroundColor: semanticFromTheme(t, "ACTIVITY_CARD_BACKGROUND"),
              paddingHorizontal: 6,
              borderRadius: 4,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ paddingVertical: 10 }}>
              <FakeText
                variant="semibold"
                size="sm"
                color={semanticFromTheme(t, "TEXT_MUTED")}
              >
                Tap here to search stuff
              </FakeText>
            </View>
            <RN.Image
              style={{
                position: "absolute",
                right: 6,
                height: "50%",
                aspectRatio: 1,
                tintColor: semanticFromTheme(t, "TEXT_MUTED"),
              }}
              source={getAssetIDByName("ic_search")}
            />
          </View>
          {...chat}
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "7.5%",
          flexDirection: "row",
          backgroundColor: semanticFromTheme(t, "BACKGROUND_FLOATING"),
          zIndex: 2,
        }}
      >
        <View style={styles.bottomCont}>
          <RN.Image
            source={getAssetIDByName("ic_discord")}
            style={[
              styles.bottomIcon,
              { tintColor: semanticFromTheme(t, "INTERACTIVE_ACTIVE") },
            ]}
          />
        </View>
        <View style={styles.bottomCont}>
          <RN.Image
            source={getAssetIDByName("friends_toast_icon")}
            style={[
              styles.bottomIcon,
              {
                tintColor: semanticFromTheme(t, "INTERACTIVE_NORMAL"),
                opacity: 0.5,
              },
            ]}
          />
        </View>
        <View style={styles.bottomCont}>
          <RN.Image
            source={getAssetIDByName("ic_search")}
            style={[
              styles.bottomIcon,
              {
                tintColor: semanticFromTheme(t, "INTERACTIVE_NORMAL"),
                opacity: 0.5,
              },
            ]}
          />
        </View>
        <View style={styles.bottomCont}>
          <RN.Image
            source={getAssetIDByName("ic_notif")}
            style={[
              styles.bottomIcon,
              {
                tintColor: semanticFromTheme(t, "INTERACTIVE_NORMAL"),
                opacity: 0.5,
              },
            ]}
          />
        </View>
        <View style={styles.bottomCont}>
          <RN.Image
            source={getAssetIDByName("ic_profile_24px")}
            style={[
              styles.bottomIcon,
              {
                tintColor: semanticFromTheme(t, "INTERACTIVE_NORMAL"),
                opacity: 0.5,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}
