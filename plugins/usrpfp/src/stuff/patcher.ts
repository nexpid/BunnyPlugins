import { logger } from "@vendetta";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { safeFetch } from "@vendetta/utils";

import { dataURL, enabled, hash, staticGifURL } from "..";
import { DataFile } from "../types";

const avatarStuff = findByProps("getUserAvatarURL", "getUserAvatarSource");

const UserStore = findByStoreName("UserStore");

let data: DataFile;
const fetchData = async () => {
  try {
    data = await (
      await safeFetch(`${dataURL}?_=${hash}`, { cache: "no-store" })
    ).json();
  } catch (e) {
    console.error("[UsrPFP] Failed to fetch avatars!");
    logger.error(`Failed to fetch avatars!\n${e.stack}`);
    showToast("USRPFP failed to fetch avatars!", getAssetIDByName("Small"));
  }
};

const getCustomAvatar = (id: string, isStatic?: boolean) => {
  if (!data.avatars[id]) return;

  const avatar = data.avatars[id];
  if (isStatic && urlExt(avatar) === "gif") return staticGifURL(avatar);

  const url = new URL(avatar);
  url.searchParams.append("_", hash);
  return url.toString();
};

const urlExt = (url: string) => new URL(url).pathname.split(".").slice(-1)[0];

export default async () => {
  const patches = new Array<() => void>();

  await fetchData();
  if (!data || !enabled) return () => {};

  const dataInterval = setInterval(() => fetchData(), 1000 * 60 * 60);
  patches.push(() => clearInterval(dataInterval));

  patches.push(
    after("getUser", UserStore, ([id], ret) => {
      const ext = data.avatars[id] && urlExt(data.avatars[id]);
      if (ext === "gif" && ret) {
        const avatar = ret.avatar ?? "0";
        ret.avatar = !avatar.startsWith("a_") ? `a_${avatar}` : avatar;
      }
    }),
  );

  patches.push(
    after("getUserAvatarURL", avatarStuff, ([{ id }, animate]) =>
      getCustomAvatar(id, !animate),
    ),
  );
  patches.push(
    after("getUserAvatarSource", avatarStuff, ([{ id }, animate], ret) => {
      const custom = getCustomAvatar(id, !animate);
      if (!custom) return;

      return custom ? { uri: custom } : ret;
    }),
  );

  return () => patches.forEach((x) => x());
};
