import { clipboard, React, ReactNative as RN } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { baseCdn, cdnFormatAnimated } from "./cdn";
import { Forms, General } from "@vendetta/ui/components";
import { Colors, LazyActionSheet, ThemeStore } from ".";
import { components, semanticColors } from "@vendetta/ui";
import { findInReactTree } from "@vendetta/utils";
import { common, findByProps } from "@vendetta/metro";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { vstorage } from "./settings";
import { DisplayProfileData } from "../../../types";

const { FormDivider, FormLabel } = Forms;
const { View } = General;

const { showShareActionSheet } = findByProps("showShareActionSheet");
const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");
const { downloadMediaAsset } = findByProps("downloadMediaAsset");
const { isAndroid } = findByProps("isAndroid");

export async function openMediaActionSheet(
  url: string,
  display: string,
  displayFor: string
) {
  const filename = url.split("/").reverse()[0];

  showSimpleActionSheet({
    key: "CardOverflow",
    header: {
      title: `${display} for ${displayFor}`,
      onClose: () => LazyActionSheet.hideActionSheet(),
    },
    options: [
      {
        label: "Copy",
        icon: getAssetIDByName("copy"),
        onPress: () => {
          LazyActionSheet.hideActionSheet();
          clipboard.setString(url);
          showToast(`${display} Copied!`, getAssetIDByName("toast_copy_link"));
        },
      },
      {
        label: "Save",
        icon: getAssetIDByName("ic_download_24px"),
        onPress: () => {
          LazyActionSheet.hideActionSheet();
          downloadMediaAsset(url, filename.endsWith("gif") ? 1 : 0);
        },
      },
      // TODO fix sharing
      {
        label: "Share",
        icon: getAssetIDByName(`ic_share_${isAndroid() ? "android" : "ios"}`),
        disabled: true,
        enabled: false,
        onPress: () => {
          showToast("Sharing not supported yet!", getAssetIDByName("Fail"));
          /*showShareActionSheet([{ url }, "Media Viewer"]);
          LazyActionSheet.hideActionSheet();*/
        },
      },
      {
        label: "Open in Browser",
        icon: getAssetIDByName("ic_open_in_browser"),
        onPress: () => {
          common.url.openURL(url);
          LazyActionSheet.hideActionSheet();
        },
      },
    ],
  });
}

export function GuildAction({
  content,
}: {
  content: {
    text: string;
    onClick: () => void;
  }[];
}) {
  const children = [];
  for (let i = 0; i < content.length; i++) {
    const x = content[i];
    children.push(
      <RN.Pressable
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "flex-start",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        accessibilityRole="button"
        accessibilityState={{ disabled: false }}
        accessible={true}
        disabled={false}
        onPress={x.onClick}
      >
        <View style={{ flexBasis: "30%", flexGrow: 1, flexShrink: 1 }}>
          <FormLabel text={x.text} />
        </View>
      </RN.Pressable>
    ); /*
    /*children.push(
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "flex-start",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        onStartShouldSetResponder={x.onClick}
        onClick={x.onClick}
      >
        <View style={{ flexBasis: "30%", flexGrow: 1, flexShrink: 1 }}>
          <FormLabel text={x.text} />
        </View>
      </View>
    );*/
    if (i !== content.length - 1) children.push(<FormDivider />);
  }

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.meta.resolveSemanticColor(
            ThemeStore.theme,
            semanticColors.BACKGROUND_TERTIARY
          ),
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {...children}
      </View>
    </View>
  );
}

export function interceptUserActions(child: any) {
  if (!vstorage.user_avatar && !vstorage.user_banner) return;

  let unpatch = after(
    "type",
    child.default,
    (_, component) => {
      if (unpatch) {
        unpatch();
        unpatch = undefined;
      }

      const children = findInReactTree(component, (x) =>
        Array.isArray(x?.children)
      );
      if (!children) return;

      console.log(
        findByProps("format", "inspect").inspect(component, { depth: Infinity })
      );
      const profileBanner = findInReactTree(
        component,
        (x) => typeof x?.type === "function" && x.type.name === "DisplayBanner"
      );
      if (!profileBanner) return;

      console.log(profileBanner);
      profileBanner.props.onPress = () => console.log("onPress");
      profileBanner.props.onTouch = () => console.log("onTouch");
      profileBanner.props.onClick = () => console.log("onClick");
      profileBanner.props.onTap = () => console.log("onTap");
      profileBanner.props.onTapGaySex = () => console.log("onTapGaySex");

      const displayProfileData = findInReactTree(
        component,
        (x) => typeof x?.displayProfile === "object"
      ) as DisplayProfileData;
      if (!displayProfileData) return;

      const { displayProfile, user } = displayProfileData;
      if (!displayProfile || !user) return;

      const hasPomelo = user.discriminator === "0";

      const dAvatar =
        user.guildMemberAvatars[displayProfile.guildId] ?? user.avatar;
      const avatarLink =
        vstorage.user_avatar && dAvatar
          ? `${baseCdn}avatars/${user.id}/${cdnFormatAnimated(dAvatar)}`
          : `${baseCdn}embed/avatars/${
              hasPomelo
                ? (parseInt(user.id) >> 22) % 6
                : parseInt(user.discriminator) % 5
            }.png`;
      const bannerLink =
        vstorage.user_banner &&
        displayProfile.banner &&
        `${baseCdn}banners/${user.id}/${cdnFormatAnimated(
          displayProfile.banner
        )}`;
    },
    true
  );
}
export function interceptGuildActions(child: any) {
  if (
    !vstorage.guild_banner &&
    !vstorage.guild_icon &&
    !vstorage.guild_invite_background
  )
    return;

  after(
    "default",
    child,
    (_, component) => {
      const children = findInReactTree(component, (x) =>
        Array.isArray(x?.children)
      )?.children as any[];
      if (!children) return;

      const guildData = findInReactTree(
        component,
        (x) => typeof x?.guild === "object"
      )?.guild;
      if (!guildData) return;

      const iconLink =
        vstorage.guild_icon &&
        guildData.icon &&
        `${baseCdn}icons/${guildData.id}/${cdnFormatAnimated(guildData.icon)}`;
      const bannerLink =
        vstorage.guild_banner &&
        guildData.banner &&
        `${baseCdn}banners/${guildData.id}/${cdnFormatAnimated(
          guildData.banner
        )}`;
      const serverInviteLink =
        vstorage.guild_invite_background &&
        guildData.splash &&
        `${baseCdn}splashes/${guildData.id}/${cdnFormatAnimated(
          guildData.splash
        )}`;

      if (!iconLink && !bannerLink && !serverInviteLink) return;

      children.splice(
        2,
        0,
        <GuildAction
          content={[
            iconLink && {
              text: "View Icon",
              onClick: () => {
                openMediaActionSheet(iconLink, "Icon", guildData.name);
                LazyActionSheet.hideActionSheet();
              },
            },
            bannerLink && {
              text: "View Banner",
              onClick: () => {
                openMediaActionSheet(bannerLink, "Banner", guildData.name);
                LazyActionSheet.hideActionSheet();
              },
            },
            serverInviteLink && {
              text: "View Server Invite",
              onClick: () => {
                openMediaActionSheet(
                  serverInviteLink,
                  "Server Invite",
                  guildData.name
                );
                LazyActionSheet.hideActionSheet();
              },
            },
          ].filter((x) => !!x)}
        />
      );
    },
    true
  );
}
