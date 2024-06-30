import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import constants from "../constants";
import { useAuthorizationStore } from "../stores/AuthorizationStore";
import { useCacheStore } from "../stores/CacheStore";
import { SavedUserData, UserData } from "../types";

export async function authFetch(url: RequestInfo, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      authorization: useAuthorizationStore.getState().token,
    },
  });

  if (res.ok) return res;
  else {
    const text = await res.text();
    showToast(text, getAssetIDByName("CircleXIcon"));
    throw new Error(text);
  }
}

export const redirectRoute = "api/auth/authorize";

export async function getData(): Promise<SavedUserData> {
  return await (
    await authFetch(`${constants.api}api/data`, {
      headers: {
        "if-modified-since": useCacheStore.getState().data?.at,
      },
    })
  ).json();
}
export async function saveData(data: UserData): Promise<true> {
  return await (
    await authFetch(`${constants.api}api/data`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
    })
  ).json();
}
export async function getRawData(): Promise<string> {
  return await (await authFetch(`${constants.api}api/data/raw`)).text();
}
export async function decompressRawData(data: string): Promise<SavedUserData> {
  return await (
    await authFetch(`${constants.api}api/data/decompress`, {
      method: "POST",
      body: data,
      headers: {
        "content-type": "text/plain",
      },
    })
  ).json();
}
export async function deleteData(): Promise<true> {
  return await (
    await authFetch(`${constants.api}api/data`, {
      method: "DELETE",
    })
  ).json();
}

export async function uploadFile(body: string): Promise<
  | {
      key: string;
    }
  | undefined
> {
  if (!useAuthorizationStore.getState().isAuthorized()) return;

  return await (
    await authFetch("https://hst.sh/documents", {
      method: "POST",
      body,
    })
  ).json();
}
