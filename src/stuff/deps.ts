import { find, findByName, findByProps } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";
import { type StateStorage } from "zustand/middleware";

//
// JS deps
//
export const WebView = find(x => x?.WebView && !x.default)
    .WebView as typeof import("react-native-webview").default;

export const Svg = findByProps("SvgXml") as typeof import("react-native-svg");

export const Reanimated = findByProps(
    "useSharedValue",
) as typeof import("react-native-reanimated");

export const FlashList = findByProps("FlashList")
    .FlashList as typeof import("@shopify/flash-list").FlashList;

export const { default: Video } = findByProps(
    "DRMType",
    "FilterType",
) as typeof import("react-native-video");

// @ts-expect-error "isJoi" is an untyped property in Joi
export const Joi = findByProps("isJoi") as typeof import("joi");

export const zustand = (findByProps("create", "useStore") ?? {
    create: findByName("create"),
}) as typeof import("zustand");

export const DocumentPicker = findByProps(
    "pickSingle",
    "isCancel",
) as typeof import("react-native-document-picker");

const _MAS = findByProps("MobileAudioSound").MobileAudioSound;

// Messy code
export class MobileAudioSound {
    // Events
    public onPlay?: () => void;
    public onStop?: () => void;
    public onEnd?: () => void;
    public onLoad?: (loaded: boolean) => void;

    private mas: any;

    public duration?: number;
    public isLoaded?: boolean;
    public isPlaying?: boolean;

    /** Preloads the audio, which automatically makes us better than Discord because they DON'T do that for some reason */
    private async _preloadSound(skip?: boolean) {
        const { _duration } = await this.mas._ensureSound();
        this.duration = _duration;
        this.isLoaded = !!_duration;

        if (!skip) this.onLoad?.(!!_duration);
        return !!_duration;
    }

    constructor(
        public url: string,
        public usage: "notification" | "voice" | "ring_tone" | "media",
        public volume: number,
        events?: {
            onPlay?: () => void;
            onStop?: () => void;
            onEnd?: () => void;
            onLoad?: (loaded: boolean) => void;
        },
    ) {
        this.mas = new _MAS(
            url,
            {
                media: "vibing_wumpus",
                notification: "activity_launch",
                ring_tone: "call_ringing",
                voice: "mute",
            }[usage],
            volume,
        );

        this._preloadSound();
        for (const [key, val] of Object.entries(events ?? {})) this[key] = val;
    }

    private _playTimeout?: number;

    /** Plays the audio */
    async play() {
        if (!this.isLoaded && this.isLoaded !== false)
            await this._preloadSound();
        if (!this.isLoaded) return;

        await this.mas.play();
        this.isPlaying = true;
        this.onPlay?.();

        clearTimeout(this._playTimeout);
        this._playTimeout = setTimeout(
            () => (this.onEnd?.(), this.stop()),
            this.duration,
        ) as any;
    }

    /** Stops the audio */
    async stop() {
        if (!this.isLoaded) return;

        this.mas.stop();
        this.isPlaying = false;
        this.onStop?.();

        clearTimeout(this._playTimeout);
        await this._preloadSound(true);
    }
}

//
// raw native modules
//
export const RNCacheModule = (RN.NativeModules.MMKVManager ??
    RN.NativeModules.NativeCacheModule) as StateStorage;

export const RNChatModule = (RN.NativeModules.DCDChatManager ??
    RN.NativeModules.NativeChatModule) as {
    updateRows: (id: string, json: string) => any;
};

export const RNFileModule = (RN.NativeModules.RTNFileManager ??
    RN.NativeModules.DCDFileManager ??
    RN.NativeModules.NativeFileModule) as {
    readFile(path: string, encoding: "base64" | "utf8"): Promise<string>;
    fileExists(path: string): Promise<boolean>;
    removeFile(
        storageDir: "documents" | "cache",
        path: string,
    ): Promise<boolean>;
    writeFile(
        storageDir: "cache" | "documents",
        path: string,
        data: string,
        encoding: "base64" | "utf8",
    ): Promise<string>;

    clearFolder(
        storageDir: "documents" | "cache",
        path: string,
    ): Promise<boolean>;
    saveFileToGallery(
        uri: `file://${string}`,
        fileName: string,
        fileType: "PNG" | "JPEG",
    ): Promise<string>;
    readAsset(path: string, encoding: "base64" | "utf8"): void;
    getSize(uri: string): Promise<boolean>;

    /** Doesn't end with / */
    CacheDirPath: string;
    /** Doesn't end with / */
    DocumentsDirPath: string;
    getConstants: () => {
        /** Doesn't end with / */
        CacheDirPath: string;
        /** Doesn't end with / */
        DocumentsDirPath: string;
    };
};
