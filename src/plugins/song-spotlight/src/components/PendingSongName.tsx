import { React } from "@vendetta/metro/common";

import Text from "$/components/Text";

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
    const [songName, setSongName] = React.useState<string | null>(null);

    React.useEffect(() => {
        setSongName(null);
        if (!id) return;

        getSongName(service, type, id).then(s => {
            setSongName(s !== false ? s : "N/A");
        });
    }, [id]);

    return (
        <Text
            variant={normal ? "text-md/semibold" : "text-md/medium"}
            color={normal ? "TEXT_NORMAL" : "TEXT_MUTED"}>
            {songName ?? "-"}
        </Text>
    );
}
