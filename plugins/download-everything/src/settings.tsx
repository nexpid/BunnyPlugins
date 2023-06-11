import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";

export const vstorage = storage as Record<
  | "voice_messages"
  | "stickers"
  | "emojis"
  | "guild_icon"
  | "guild_banner"
  | "guild_invite_background"
  | "user_avatar"
  | "user_banner",
  boolean | undefined
>;

const { ScrollView, View } = General;
const { FormDivider, FormIcon, FormSwitchRow } = Forms;
const { TableRowGroup } = findByProps("TableRowGroup");

export const settingsThing = [
  {
    title: "General",
    children: [
      {
        name: "Voice Messages (WIP)",
        action: "Tap and hold",
        icon: "ic_speaker",
        key: "voice_messages",
      },
      {
        name: "Stickers (WIP)",
        action: "Tap and hold",
        icon: "ic_sticker_24px",
        key: "stickers",
      },
      {
        name: "Emojis (WIP)",
        action: "Tap and hold",
        icon: "img_nitro_emojis",
        key: "emojis",
      },
    ],
  },
  {
    title: "Server",
    children: [
      {
        name: "Icon",
        action: "Tap on server name > View Icon",
        icon: "ic_image",
        key: "guild_icon",
      },
      {
        name: "Banner",
        action: "Tap on server name > View Banner",
        icon: "ic_image",
        key: "guild_banner",
      },
      {
        name: "Invite Background",
        action: "Tap on server name > View Invite Background",
        icon: "ic_image",
        key: "guild_invite_background",
      },
    ],
  },
  {
    title: "User",
    children: [
      {
        name: "Avatar (WIP)",
        action: "Tap and hold",
        icon: "ic_image",
        key: "user_avatar",
      },
      {
        name: "Banner (WIP)",
        action: "Tap and hold",
        icon: "ic_image",
        key: "user_banner",
      },
    ],
  },
];

export default () => {
  useProxy(vstorage);

  // set defaults
  for (const x of settingsThing) {
    for (const y of x.children) {
      vstorage[y.key] ??= true;
    }
  }

  return (
    <ScrollView>
      <View style={{ marginTop: 16, marginHorizontal: 16 }}>
        {...settingsThing.map((x) => (
          <TableRowGroup title={x.title} hasIcons={false}>
            {...x.children.map((y) => (
              <>
                <FormSwitchRow
                  label={y.name}
                  subLabel={y.action}
                  leading={<FormIcon source={getAssetIDByName(y.icon)} />}
                  onValueChange={(v) => (vstorage[y.key] = v)}
                  value={vstorage[y.key]}
                />
                <FormDivider />
              </>
            ))}
          </TableRowGroup>
        ))}
      </View>
    </ScrollView>
  );
};
