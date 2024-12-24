import { findByName, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";

import ProfileSongs from "../components/ProfileSongs";
import { unsubAuthStore } from "../stores/AuthorizationStore";
import { unsubCacheStore } from "../stores/CacheStore";

const YouAboutMeCard = findByName("YouAboutMeCard", false);
const SimplifiedUserProfileAboutMeCard = findByName(
    "SimplifiedUserProfileAboutMeCard",
    false,
);
const UserProfileBio = findByName("UserProfileBio", false);
const ThemeStore = findByStoreName("ThemeStore");

export default function () {
    const patches = new Array<any>();

    patches.push(
        after("default", YouAboutMeCard, ([{ userId }], ret) =>
            React.createElement(React.Fragment, {}, [
                React.createElement(ProfileSongs, {
                    userId,
                    variant: "you",
                }),
                ret,
            ]),
        ),
    );

    patches.push(
        after(
            "default",
            SimplifiedUserProfileAboutMeCard,
            ([{ userId, style }], ret) =>
                React.createElement(React.Fragment, {}, [
                    React.createElement(ProfileSongs, {
                        userId,
                        variant: "simplified",
                        style,
                    }),
                    ret,
                ]),
        ),
    );

    patches.push(
        after("default", UserProfileBio, ([{ displayProfile }], ret) =>
            displayProfile
                ? React.createElement(React.Fragment, {}, [
                      React.createElement(ProfileSongs, {
                          userId: displayProfile.userId,
                          variant: "classic",
                          style: displayProfile.themeColors ? {} : undefined,
                          customBorder: displayProfile.themeColors
                              ? ThemeStore.theme === "light"
                                  ? "rgba(0, 0, 0, 0.24)"
                                  : "rgba(255, 255, 255, 0.24)"
                              : undefined,
                      }),
                      ret,
                  ])
                : ret,
        ),
    );

    patches.push(unsubAuthStore);
    patches.push(unsubCacheStore);

    return () => {
        patches.forEach(x => x());
    };
}
