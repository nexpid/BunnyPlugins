import { React } from "@vendetta/metro/common";
import { findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import UserProfileSongs from "../components/UserProfileSongs";

const UserProfileBio = findByName("UserProfileBio", false);

export default function () {
  const patches = new Array<() => void>();

  patches.push(
    after("default", UserProfileBio, ([x], ret) => {
      return React.createElement(React.Fragment, {}, [
        x?.displayProfile?.userId &&
          React.createElement(UserProfileSongs, {
            userId: x.displayProfile.userId,
          }),
        ret,
      ]);
    })
  );

  return () => patches.forEach((x) => x());
}
