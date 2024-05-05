import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";

import { PlusStructure } from "$/typings";

import { PatchType } from "..";
import { state } from "../stuff/active";
import { patches } from "../stuff/loader";
import resolveColor from "../stuff/resolveColor";

const MaskedBadge = findByProps("MaskedBadge");

export default function patchUnreadBadgeColor(plus: PlusStructure) {
  if (plus.unreadBadgeColor) {
    state.patches.push(PatchType.UnreadBadgeColor);

    patches.push(
      after("MaskedBadge", MaskedBadge, (_, ret) => {
        const badge =
          ret && findInReactTree(ret, (x) => x?.type?.name === "Badge");
        if (badge)
          patches.push(
            after(
              "type",
              badge,
              (_, bdg) =>
                bdg?.props &&
                (bdg.props.style = [
                  bdg.props.style,
                  {
                    backgroundColor: resolveColor(plus.unreadBadgeColor),
                  },
                ]),
              true,
            ),
          );
      }),
    );
    patches.push(
      after(
        "default",
        MaskedBadge,
        (_, ret) =>
          ret?.props &&
          (ret.props.style = [
            ret.props.style,
            {
              backgroundColor: resolveColor(plus.unreadBadgeColor),
            },
          ]),
      ),
    );
  }
}
