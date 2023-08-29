import { safeFetch } from "@vendetta/utils";
import { DataFile } from "../types";
import { dataURL, enabled } from "..";
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
    data = await (await safeFetch(dataURL, { cache: "no-store" })).json();
  } catch (e) {
    logger.error(`Failed to fetch avatars!\n${e.stack}`);
  }
};

export default async () => {
  const patches = new Array<() => void>();

  await fetchData();
  if (!data || !enabled) return () => {};

  const dataInterval = setInterval(() => fetchData(), 1000 * 60 * 60);
  patches.push(() => clearInterval(dataInterval));

  patches.push(
    after("getUserAvatarURL", avatarStuff, ([{ id }]) => data.avatars[id])
  );
  patches.push(
    after("getUserAvatarSource", avatarStuff, ([{ id }], ret) =>
      data.avatars[id] ? { uri: data.avatars[id] } : ret
    )
  );

  data.badges.nexpid = "https://i.ibb.co/sHjkdKv/fish-crop.png";

  const emptySymbol = Symbol("empty");
  const badgeIconPrefix = "usrpfp-";

  patches.push(
    after("getUserProfile", UserProfileStore, ([id], ret) => {
      const username = UserStore.getUser(id)?.username;
      return ret
        ? {
            ...ret,
            badges: [
              data.badges[username]
                ? {
                    id: "usrpfp-custom",
                    description: `${username}'s custom USRPFP badge`,
                    icon: badgeIconPrefix + data.badges[username],
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