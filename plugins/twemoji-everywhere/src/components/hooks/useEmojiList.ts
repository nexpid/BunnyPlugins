import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { safeFetch } from "@vendetta/utils";

/** UNUSED */

type EmojiListType = null | Record<string, string[]>;
const url = "https://unicode.org/Public/emoji/latest/emoji-test.txt";

export default function (): EmojiListType {
  const [data, setData] = React.useState<EmojiListType>(null);

  React.useEffect(() => {
    safeFetch(url)
      .then((x) =>
        x
          .text()
          .then((dt) => {
            try {
              const groups = {};
              let curGroup: string;

              for (const line of dt.replace(/\r/g, "").split("\n")) {
                const newGroup = line.match(/^# group: (.+)/);
                const qualification = line.match(
                  /; ((?:fully)|(?:minimally)-qualified)/,
                );

                if (newGroup?.[1]) {
                  curGroup = newGroup[1];
                  groups[curGroup] = [];
                } else if (qualification?.[1] && curGroup) {
                  const points = line.split(" ");
                  const unicode = points
                    .slice(0, points.indexOf(";"))
                    .filter((x) => !!x)
                    .map((x) => x.toLowerCase())
                    .join("-");
                  groups[curGroup]?.push(unicode);
                }
              }

              setData(groups);
            } catch (e) {
              console.log(e);
            }
          })
          .catch(() =>
            showToast("Failed to parse emoji list!", getAssetIDByName("Small")),
          ),
      )
      .catch(() =>
        showToast("Failed to fetch emoji list!", getAssetIDByName("Small")),
      );
  });

  return data;
}
