import { HTTP_REGEX_MULTI } from "@vendetta/constants";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";

import RNFS from "$/wrappers/RNFS";

import { unsubRulesStore } from "../stores/RulesStore";
import { _depreacted_filePath, cleanUrl } from "./rules";

const Messages = findByProps("sendMessage", "editMessage");
const { DCDChatManager } = RN.NativeModules;

const clean = (text: string) =>
    text.replace(HTTP_REGEX_MULTI, str => {
        let url: URL;
        try {
            url = new URL(str);
        } catch {
            return str;
        }

        return cleanUrl(url.toString());
    });

const handleMessage = (msg: any) => {
    if (msg?.content) msg.content = clean(msg.content);
};

interface Content {
    type?: "link";
    content: Content[] | string;
    target?: string;
}

const handleContent = (content: Content[]) => {
    for (const thing of content) {
        if (thing.type === "link" && thing.target)
            thing.target = clean(thing.target);

        if (typeof thing.content === "string")
            thing.content = clean(thing.content);
        else if (Array.isArray(thing.content))
            thing.content = handleContent(thing.content);
    }
    return content;
};

export default function () {
    const patches = new Array<() => void>();

    // STUB[epic=plugin] get rid of this one day
    RNFS.exists(_depreacted_filePath()).then(
        yes => yes && RNFS.unlink(_depreacted_filePath()),
    );

    patches.push(
        before("sendMessage", Messages, args => {
            handleMessage(args[1]);
        }),
    );
    patches.push(
        before("editMessage", Messages, args => {
            handleMessage(args[2]);
        }),
    );

    patches.push(
        before("updateRows", DCDChatManager, args => {
            const rows = JSON.parse(args[1]);
            for (const row of rows)
                if (row.message?.content)
                    row.message.content = handleContent(row.message.content);

            args[1] = JSON.stringify(rows);
        }),
    );

    patches.push(unsubRulesStore);

    return () => {
        patches.forEach(x => {
            x();
        });
    };
}
