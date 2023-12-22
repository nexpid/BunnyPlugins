import { React } from "@vendetta/metro/common";

import { SimpleText } from "../../../../stuff/types";
import { getSongName } from "../stuff/songs";
import { EditableSong } from "../types";

export default function ({
  service,
  type,
  id,
  normal,
}: {
  service: EditableSong["service"];
  type: EditableSong["type"];
  id: EditableSong["id"];
  normal: boolean;
}) {
  const [songName, setSongName] = React.useState<string>(null);

  React.useEffect(() => {
    setSongName(undefined);
    if (!id) return;

    getSongName(service, type, id).then((s) =>
      setSongName(s !== false ? s : "N/A"),
    );
  }, [id]);

  return (
    <SimpleText
      variant={normal ? "text-md/semibold" : "text-md/medium"}
      color={normal ? "TEXT_NORMAL" : "TEXT_MUTED"}
    >
      {songName ?? "-"}
    </SimpleText>
  );
}
