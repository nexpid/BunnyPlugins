import { logger } from "@vendetta";
import { findByStoreName } from "@vendetta/metro";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { lang, vstorage } from "..";
import constants from "../constants";
import { useAuthorizationStore } from "../stores/AuthorizationStore";
import { useCacheStore } from "../stores/CacheStore";
import { UserData } from "../types";

const UserStore = findByStoreName("UserStore");

export async function authFetch(_url: string | URL, options?: RequestInit) {
    const url = new URL(_url);

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options?.headers,
            authorization: useAuthorizationStore.getState().token,
        } as any,
    });

    if (res.ok) return res;
    else {
        // not modified
        if (res.status === 304) return null;

        const text = await res.text();
        showToast(
            !text.includes("<body>") && res.status >= 400 && res.status <= 599
                ? lang.format("toast.fetch_error_detailed", { error_msg: text })
                : lang.format("toast.fetch_error", { urlpath: url.pathname }),
            getAssetIDByName("CircleXIcon-primary"),
        );
        logger.error(
            "authFetch error",
            options?.method ?? "GET",
            url.toString(),
            res.status,
            text,
        );
        throw new Error(text);
    }
}

export const redirectRoute = "api/auth/authorize";

export async function getData(): Promise<UserData> {
    if (Date.now() - vstorage.lastCheck <= 90_000)
        return useCacheStore.getState().data!;
    vstorage.lastCheck = Date.now();

    return await authFetch(`${constants.api}api/data`, {
        headers: {
            "if-modified-since": useCacheStore.getState().at,
        } as any,
    }).then(async res => {
        if (!res) return useCacheStore.getState().data;

        const dt = await res.json();
        useCacheStore
            .getState()
            .updateData(
                dt,
                res.headers.get("last-modified") ?? undefined,
                Date.now() + 3600_000,
            );
        return dt;
    });
}
export async function listData(user: string): Promise<UserData | undefined> {
    const data = useCacheStore.getState().dir[user];
    if (data?.revalidateAt && data.revalidateAt > Date.now()) return data.data;

    if (user === UserStore.getCurrentUser()?.id)
        vstorage.lastCheck = Date.now();

    return await authFetch(`${constants.api}api/data/${user}`, {
        headers: {
            "if-modified-since": data?.at,
        } as any,
    }).then(async res => {
        if (!res) return undefined;

        const data = (await res.json()) || undefined;
        useCacheStore.getState().updateDir(user, {
            data,
            at: res.headers.get("last-modified") || undefined,
            revalidateAt: Date.now() + 3600_000,
        });
        return data;
    });
}
export async function saveData(data: UserData): Promise<true> {
    return await authFetch(`${constants.api}api/data`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "content-type": "application/json",
        },
    })
        .then(res => res!.json())
        .then(json => {
            useCacheStore.getState().updateData(data, new Date().toUTCString());
            return json;
        });
}
export async function deleteData(): Promise<true> {
    return await authFetch(`${constants.api}api/data`, {
        method: "DELETE",
    })
        .then(res => res!.json())
        .then(json => {
            useCacheStore.getState().updateData();
            return json;
        });
}
