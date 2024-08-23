import { findByName } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { before, instead } from "@vendetta/patcher";
import { getAssetByID, getAssetIDByName } from "@vendetta/ui/assets";

import { PlusStructure } from "$/typings";

import { PatchType } from "..";
import { state } from "../stuff/active";
import { bunnyIconDataUri } from "../stuff/bunnyIcon";
import { getIconOverlay, getIconTint } from "../stuff/iconOverlays";
import { patches } from "../stuff/loader";
import { iconsPath, isPackInstalled } from "../stuff/packInstaller";
import { fixPath, flattenFilePath } from "../stuff/util";
import { BunnyAsset, IconpackConfig } from "../types";

const Status = findByName("Status", false);

export default function patchIcons(
    plus: PlusStructure,
    tree: string[],
    config: IconpackConfig,
) {
    const { iconpack } = state.iconpack;
    if (config.biggerStatus)
        patches.push(
            before("default", Status, _args => {
                const args = _args.slice();

                const sizes = Object.values(Status.StatusSizes);
                const index = sizes.findIndex(x => args[0].size === x);
                args[0] = {
                    ...args[0],
                    size:
                        (index !== -1 ? sizes[index + 1] : null) ??
                        Status.StatusSizes.XLARGE,
                };

                return args;
            }),
        );

    let isInstalled = false;
    isPackInstalled(iconpack!).then(x => (isInstalled = !!x));

    if (plus.icons || plus.customOverlays || iconpack) {
        if (plus.icons) state.patches.push(PatchType.Icons);
        if (plus.customOverlays)
            state.patches.push(PatchType.CustomIconOverlays);
        if (iconpack) state.patches.push(PatchType.Iconpack);

        patches.push(
            instead("render", RN.Image, (_args, orig) => {
                const args = _args.slice();
                const [props] = args;

                if (props.ignore) return orig(...args);
                const { source } = props;

                let asset: BunnyAsset | null = null;

                // theme the Bunny icon
                if (source?.uri === bunnyIconDataUri)
                    asset = {
                        httpServerLocation: "//_",
                        width: 64,
                        height: 64,
                        name: "bunny",
                        type: "png",
                    };
                // any other asset
                else if (typeof props.source === "number")
                    asset = getAssetByID(source) as any;

                if (!asset?.httpServerLocation) return orig(...args);

                const assetIconpackLocation =
                    iconpack &&
                    fixPath(
                        [
                            ...asset.httpServerLocation.split("/").slice(2),
                            `${asset.name}${iconpack.suffix}.${asset.type}`,
                        ].join("/"),
                    );
                const useIconpack =
                    assetIconpackLocation &&
                    (tree.length ? tree.includes(assetIconpackLocation) : true);

                let overlay: any;
                if (plus.customOverlays && !useIconpack) {
                    overlay = getIconOverlay(plus, source, props.style);
                    if (overlay) {
                        if (overlay.replace)
                            props.source = getAssetIDByName(overlay.replace);
                        if (overlay.style)
                            props.style = [props.style, overlay.style];
                    }
                }

                if (plus.icons) {
                    const tint = getIconTint(plus, source);
                    if (tint)
                        props.style = [
                            props.style,
                            {
                                tintColor: tint,
                            },
                        ];
                }

                if (useIconpack)
                    props.source = {
                        uri: isInstalled
                            ? `file://${iconsPath}${iconpack.id}/${flattenFilePath(assetIconpackLocation)}`
                            : iconpack.load + assetIconpackLocation,
                        headers: {
                            "cache-contorl": "public, max-age=3600",
                        },
                        width: asset.width,
                        height: asset.height,
                    };

                const ret = orig(...args);

                return overlay?.children ? (
                    <RN.View>
                        {ret}
                        {overlay.children}
                    </RN.View>
                ) : (
                    ret
                );
            }),
        );
    }
}
