import { safeFetch } from "@vendetta/utils";
import { DataFile } from "../types";
import { dataURL, enabled, hash, staticGifURL } from "..";
import { logger } from "@vendetta";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

const avatarStuff = findByProps("getUserAvatarURL", "getUserAvatarSource");
const badgeStuff = findByProps("getBadgeAsset");

const UserProfileStore = findByStoreName("UserProfileStore");
const UserStore = findByStoreName("UserStore");

let data: DataFile;
const fetchData = async () => {
  try {
    data = await (
      await safeFetch(`${dataURL}?_=${hash}`, { cache: "no-store" })
    ).json();
  } catch (e) {
    logger.error(`Failed to fetch avatars!\n${e.stack}`);
  }
};

const getCustomAvatar = (id: string, isStatic?: boolean) => {
  if (!data.avatars[id]) return;

  const url = new URL(
    isStatic ? staticGifURL(data.avatars[id]) : data.avatars[id]
  );
  url.searchParams.append("_", hash);
  return url.toString();
};

const getCustomBadge = (id: string, username: string) => {
  const val = data.badges[id] ?? data.badges[username];
  if (!val) return;

  const url = new URL(val);
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
    })
  );

  patches.push(
    after("getUserAvatarURL", avatarStuff, ([{ id }, animate]) => {
      const custom = getCustomAvatar(id, !animate);
      if (!custom) return;

      if (urlExt(custom) === "gif") {
        if (animate) return custom;
        else return staticGifURL(custom);
      }

      return custom;
    })
  );
  patches.push(
    after("getUserAvatarSource", avatarStuff, ([{ id }, animate]) => {
      const custom = getCustomAvatar(id, !animate);
      if (!custom) return;

      if (urlExt(custom) === "gif") {
        if (animate) return { uri: custom };
        else return { uri: staticGifURL(custom) };
      }

      return custom;
    })
  );

  const emptySymbol = Symbol("empty");
  const badgeIconPrefix = "usrpfp-";

  patches.push(
    after("getUserProfile", UserProfileStore, ([id], ret) => {
      const username = UserStore.getUser(id)?.username;
      const badge = getCustomBadge(id, username);

      return ret
        ? {
            ...ret,
            badges: [
              badge
                ? {
                    id: "usrpfp-custom",
                    description: `${username}'s custom USRPFP badge`,
                    icon: badgeIconPrefix + badge,
                  }
                : emptySymbol,
              ...ret.badges,
            ].filter((x) => x !== emptySymbol),
          }
        : ret;
    })
  );
  patches.push(
    after("getBadgeAsset", badgeStuff, ([icon]: [string], ret) =>
      icon.startsWith(badgeIconPrefix)
        ? icon.slice(badgeIconPrefix.length)
        : ret
    )
  );

  return () => patches.forEach((x) => x());
};
