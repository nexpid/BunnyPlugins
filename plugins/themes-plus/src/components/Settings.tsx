import { General } from "@vendetta/ui/components";
import { PatchType, active } from "..";
import { findByName, findByProps } from "@vendetta/metro";
import { ReactNative as RN, url } from "@vendetta/metro/common";
import {
  SimpleText,
  doHaptic,
  openModal,
  openSheet,
} from "../../../../stuff/types";
import { getAssetIDByName } from "@vendetta/ui/assets";
import DevModal from "./modals/DevModal";
import IconpackInfoSheet from "./sheets/IconpackInfoSheet";
import { showConfirmationAlert } from "@vendetta/ui/alerts";

const { View } = General;
const { TextStyleSheet } = findByProps("TextStyleSheet");

const WebView = findByName("WebView") ?? findByProps("WebView").default.render;

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
                uri: "asset:/emoji-2705.png",
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
              <View style={{ flexDirection: "row", maxWidth: "85%" }}>
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
              uri: "asset:/emoji-274c.png",
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
            onPress={() => {
              if (lastTap >= Date.now()) {
                doHaptic(20);
                openModal("dev-modal", DevModal);
              } else lastTap = Date.now() + 500;
            }}
          >
            Themes+ is not Active
          </SimpleText>
        </View>
      )}
      {active.blehhh.map((reason) => (
        <View
          style={{
            flexDirection: "row",
            maxWidth: "85%",
          }}
        >
          <RN.Image
            source={{
              uri: "asset:/emoji-2139.png",
            }}
            style={{
              height: TextStyleSheet["text-lg/semibold"].fontSize,
              aspectRatio: 1 / 1,
              marginRight: 8,
              marginTop: 6,
            }}
          />
          <SimpleText
            variant="text-lg/semibold"
            color="TEXT_NORMAL"
            style={{ flexWrap: "wrap", flex: 1 }}
          >
            {reason}
          </SimpleText>
        </View>
      ))}
      <SimpleText
        variant="text-lg/bold"
        color="TEXT_LINK"
        style={{ textDecorationLine: "underline", marginTop: 32 }}
        onPress={() =>
          showConfirmationAlert({
            title: "GitHub FAQ",
            //@ts-ignore unadded in typings
            children: (
              <View style={{ height: 400 }}>
                <WebView
                  source={{
                    uri: "https://github.com/nexpid/VendettaThemesPlus#faq",
                  }}
                  style={{ height: 400, width: "100%" }}
                />
              </View>
            ),
            confirmText: "Open in browser",
            confirmColor: "brand" as ButtonColors,
            onConfirm: () =>
              url.openURL("https://github.com/nexpid/VendettaThemesPlus#faq"),
            isDismissable: true,
          })
        }
      >
        Why is Themes+ inactive?
      </SimpleText>
    </View>
  );
}
