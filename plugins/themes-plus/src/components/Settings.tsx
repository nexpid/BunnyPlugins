import { ReactNative as RN, url } from "@vendetta/metro/common";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { General } from "@vendetta/ui/components";

import SimpleText from "$/components/SimpleText";
import { WebView } from "$/deps";
import { doHaptic, openModal, openSheet, TextStyleSheet } from "$/types";

import { active, lang, PatchType } from "..";
import DevModal from "./modals/DevModal";
import IconpackInfoSheet from "./sheets/IconpackInfoSheet";

const { View } = General;

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
              {lang.format("settings.is_active", {})}
            </SimpleText>
          </View>
          <View style={{ flexDirection: "column", marginHorizontal: 16 }}>
            {[
              [PatchType.Icons],
              [PatchType.UnreadBadgeColor],
              [PatchType.CustomIconOverlays],
              [PatchType.MentionLineColor],
              [
                PatchType.IconPack,
                active.iconpack && (
                  <SimpleText
                    variant="text-lg/bold"
                    color="TEXT_LINK"
                    onPress={() => openSheet(IconpackInfoSheet, undefined)}
                  >
                    {lang.format("settings.patch.iconpack", {})}
                  </SimpleText>
                ),
              ],
            ].map(([type, children]: [PatchType, any]) => (
              <View style={{ flexDirection: "row", maxWidth: "85%" }}>
                <RN.Image
                  source={getAssetIDByName(
                    active.patches.includes(type)
                      ? "ic_radio_square_checked_24px"
                      : "ic_radio_square_24px",
                  )}
                  style={{
                    marginRight: 8,
                    height: TextStyleSheet["text-lg/semibold"].fontSize,
                    aspectRatio: 1 / 1,
                    marginTop: 4,
                  }}
                  resizeMode="cover"
                />
                {children ? (
                  children
                ) : (
                  <SimpleText variant="text-lg/semibold" color="TEXT_NORMAL">
                    {lang.format(`settings.patch.${type}`, {})}
                  </SimpleText>
                )}
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
            {lang.format("settings.is_inactive", {})}
          </SimpleText>
        </View>
      )}
      {active.blehhh.map((reason) => (
        <View
          style={{
            flexDirection: "row",
            maxWidth: "85%",
            marginTop: 10,
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
            style={{ flexWrap: "wrap" }}
          >
            {lang.format(`settings.inactive.${reason}`, {})}
          </SimpleText>
        </View>
      ))}
      <SimpleText
        variant="text-lg/bold"
        color="TEXT_LINK"
        style={{ textDecorationLine: "underline", marginTop: 32 }}
        onPress={() =>
          showConfirmationAlert({
            title: lang.format("alert.faq.title", {}),
            //@ts-expect-error unadded in typings
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
            confirmText: lang.format("alert.faq.confirm", {}),
            confirmColor: "brand" as ButtonColors,
            onConfirm: () =>
              url.openURL("https://github.com/nexpid/VendettaThemesPlus#faq"),
            isDismissable: true,
          })
        }
      >
        {lang.format("settings.open_faq", {})}
      </SimpleText>
    </View>
  );
}
