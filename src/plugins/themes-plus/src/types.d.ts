export interface IconpackConfig {
    biggerStatus?: boolean;
}

export interface Iconpack {
    id: string;
    name: string;
    description: string;
    credits: {
        authors: {
            name: string;
            id?: string;
        }[];
        /** @deprecated */
        source?: string;
        sources: string[];
    };
    config: string | null;
    suffix: string;
    load: string;
}

export interface IconpackData {
    $schema: string;
    list: Iconpack[];
}

export interface CoolAsset {
    __packager_asset: boolean;
    httpServerLocation: string;
    width: number;
    height: number;
    scales: number[];
    hash: string;
    name: string;
    type: string;
}
