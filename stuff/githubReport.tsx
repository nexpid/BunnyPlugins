import { getDebugInfo } from "@vendetta/debug";
import constants from "./constants";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { ReactNative as RN, clipboard } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");
const UserStore = findByStoreName("UserStore");

// from the sysinfo plugin
export function getSysInfo(): string {
  const info = getDebugInfo() as any;
  const discordInfo =
    RN.NativeModules.InfoDictionaryManager ??
    RN.NativeModules.RTNClientInfoManager;

  return `Device: ${
    info.os.name === "iOS"
      ? info.device.codename
      : `${info.device.brand} ${info.device.model}`
  }
Model: ${info.device.model}
Manufacturer: ${info.device.manufacturer}
Brand: ${info.device.brand}

OS: ${info.os.name}
Version: ${info.os.version}

Discord Branch: ${discordInfo.ReleaseChannel}
Discord Version: ${info.discord.version}
Discord Build: ${info.discord.build}
Vendetta Version: ${info.vendetta.version}

React Version: ${info.react.version}
Hermes Bytecode: ${info.hermes.bytecodeVersion}`;
}

export function getNewIssueUrl(exparams: Record<string, string>) {
  const user = UserStore.getCurrentUser();

  const params = new URLSearchParams();
  for (const [x, y] of Object.entries(exparams)) params.set(x, y);
  params.set(
    "discord-username",
    `@${user.username}${
      user.discriminator !== "0" ? `#${user.discriminator}` : ""
    }`
  );

  console.log(`${constants.github.url}issues/new?${params.toString()}`);
  return `${constants.github.url}issues/new?${params.toString()}`;
}

export const openPluginReportSheet = (plugin: string) =>
  showSimpleActionSheet({
    key: "CardOverflow",
    header: {
      title: "GitHub Reports",
    },
    options: [
      {
        label: "Copy bug report link",
        icon: getAssetIDByName("copy"),
        onPress: () => {
          clipboard.setString(
            getNewIssueUrl({
              title: `bug(${plugin}): `,
              template: `bug_report.yml`,
              labels: "bug",
              sysinfo: getSysInfo(),
            })
          );
          showToast("Copied", getAssetIDByName("toast_copy_link"));
        },
      },
      {
        label: "Copy feature suggestion link",
        icon: getAssetIDByName("copy"),
        onPress: () => {
          clipboard.setString(
            getNewIssueUrl({
              title: `suggest(${plugin}): `,
              labels: "suggestion",
              template: `suggestion.yml`,
            })
          );
          showToast("Copied", getAssetIDByName("toast_copy_link"));
        },
      },
    ],
  });
