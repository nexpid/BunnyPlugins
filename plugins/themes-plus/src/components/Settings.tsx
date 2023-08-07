import { General } from "@vendetta/ui/components";
import { PatchType, active } from "..";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN, url } from "@vendetta/metro/common";
import { SimpleText, openModal, openSheet } from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import DevModal from "./modals/DevModal";
import IconpackInfoSheet from "./sheets/IconpackInfoSheet";

const { View } = General;

const twemojiCDN = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/`;

const { TextStyleSheet } = findByProps("TextStyleSheet");

export default function () {
  let lastTap = 0;

  return (
    <View
      style={{
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      {active.active ? (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <RN.Image
              source={{
                uri: `${twemojiCDN}2705.png`,
              }}
              style={{
                height: TextStyleSheet["heading-xxl/semibold"].fontSize,
                aspectRatio: 1 / 1,
                marginRight: 8,
                marginTop: 6,
              }}
            />
            <SimpleText
              variant="heading-xxl/semibold"
              color="TEXT_NORMAL"
              onPress={() =>
                lastTap >= Date.now()
                  ? openModal("dev-modal", DevModal)
                  : (lastTap = Date.now() + 500)
              }
            >
              Themes+ is Active
            </SimpleText>
          </View>
          <View style={{ flexDirection: "column", marginHorizontal: 16 }}>
            {[
              [PatchType.Icons, ["Custom icon colors"]],
              [PatchType.UnreadBadgeColor, ["Unread badge color"]],
              [PatchType.CustomIconOverlays, ["Custom icon overlays"]],
              [PatchType.MentionLineColor, ["Mention line color"]],
              [
                PatchType.IconPack,
                active.iconpack
                  ? [
                      <SimpleText
                        variant="text-lg/bold"
                        color="TEXT_LINK"
                        onPress={() => openSheet(IconpackInfoSheet, {})}
                      >
                        Custom icon pack
                      </SimpleText>,
                    ]
                  : ["Custom icon pack"],
              ],
            ].map(([type, children]: [PatchType, any[]]) => (
              <View style={{ flexDirection: "row" }}>
                <RN.Image
                  source={getAssetIDByName(
                    active.patches.includes(type)
                      ? "ic_radio_square_checked_24px"
                      : "ic_radio_square_24px"
                  )}
                  style={{
                    marginRight: 8,
                    height: TextStyleSheet["text-lg/semibold"].fontSize,
                    aspectRatio: 1 / 1,
                    marginTop: 4,
                  }}
                />
                <SimpleText variant="text-lg/semibold" color="TEXT_NORMAL">
                  {children}
                </SimpleText>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <RN.Image
            source={{
              uri: `${twemojiCDN}274c.png`,
            }}
            style={{
              height: TextStyleSheet["heading-xxl/semibold"].fontSize,
              aspectRatio: 1 / 1,
              marginRight: 8,
              marginTop: 6,
            }}
          />
          <SimpleText
            variant="heading-xxl/semibold"
            color="TEXT_NORMAL"
            onPress={() =>
              lastTap >= Date.now()
                ? openModal("dev-modal", DevModal)
                : (lastTap = Date.now() + 500)
            }
          >
            Themes+ is not Active
          </SimpleText>
        </View>
      )}
      <SimpleText
        variant="text-lg/bold"
        color="TEXT_LINK"
        style={{ textDecorationLine: "underline", marginTop: 32 }}
        onPress={() =>
          url.openURL("https://github.com/Gabe616/VendettaThemesPlus#info")
        }
      >
        Why is Themes+ inactive?
      </SimpleText>
      <SimpleText
        variant="text-lg/bold"
        color="TEXT_LINK"
        style={{ textDecorationLine: "underline", marginTop: 4 }}
        onPress={() =>
          url.openURL(
            "https://github.com/Gabe616/VendettaThemesPlus#using-vendetta-themes"
          )
        }
      >
        How to use Themes+?
      </SimpleText>
    </View>
  );
}
