import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import constants from "../constants";
import { useAuthorizationStore } from "../stores/AuthorizationStore";
import { useCacheStore } from "../stores/CacheStore";
import { UserData } from "../types";

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

export async function getData(): Promise<UserData> {
  return await authFetch(`${constants.api}api/data`, {
    headers: {
      "if-modified-since": useCacheStore.getState().at,
    },
  }).then(async (res) => {
    const dt = await res.json();
    useCacheStore.getState().updateData(dt, res.headers.get("last-modified"));
    return dt;
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
    .then((res) => res.json())
    .then((json) => {
      useCacheStore.getState().updateData(data, new Date().toUTCString());
      return json;
    });
}
export async function deleteData(): Promise<true> {
  return await authFetch(`${constants.api}api/data`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((json) => {
      useCacheStore.getState().updateData(null, null);
      return json;
    });
}

export async function getRawData(): Promise<string> {
  return await (await authFetch(`${constants.api}api/data/raw`)).text();
}
export async function decompressRawData(data: string): Promise<UserData> {
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
