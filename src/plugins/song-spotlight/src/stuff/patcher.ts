import { findByName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";

import UserProfileSongs from "../components/UserProfileSongs";

const UserProfileBio = findByName("UserProfileBio", false);
const YouAboutMeCard = findByName("YouAboutMeCard", false);

export default function () {
    const patches = new Array<() => void>();

    patches.push(
        after("default", UserProfileBio, ([x], ret) => {
            return React.createElement(React.Fragment, {}, [
                x?.displayProfile?.userId &&
          React.createElement(UserProfileSongs, {
              userId: x.displayProfile.userId,
              you: false,
          }),
                ret,
            ]);
        }),
    );

    patches.push(
        after("default", YouAboutMeCard, ([{ userId }], ret) => {
            return React.createElement(React.Fragment, {}, [
                React.createElement(UserProfileSongs, {
                    userId,
                    you: true,
                }),
                ret,
            ]);
        }),
    );

    return () => { patches.forEach(x => { x(); }); };
}
