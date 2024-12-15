import { findByName } from "@vendetta/metro";
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

export default function () {
    const patches = new Array<any>();

    patches.push(
        after("default", YouAboutMeCard, ([{ userId }], ret) =>
            React.createElement(React.Fragment, {}, [
                React.createElement(ProfileSongs, {
                    userId,
                    style: "you",
                }),
                ret,
            ]),
        ),
    );

    patches.push(
        after(
            "default",
            SimplifiedUserProfileAboutMeCard,
            ([{ userId }], ret) =>
                React.createElement(React.Fragment, {}, [
                    React.createElement(ProfileSongs, {
                        userId,
                        style: "simplified",
                    }),
                    ret,
                ]),
        ),
    );

    patches.push(
        after(
            "default",
            UserProfileBio,
            (
                [
                    {
                        displayProfile: { userId },
                    },
                ],
                ret,
            ) =>
                React.createElement(React.Fragment, {}, [
                    React.createElement(ProfileSongs, {
                        userId,
                        style: "classic",
                    }),
                    ret,
                ]),
        ),
    );

    patches.push(unsubAuthStore);
    patches.push(unsubCacheStore);

    return () => {
        patches.forEach(x => x());
    };
}
