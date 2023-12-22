import { findByStoreName } from "@vendetta/metro";

import { AuthRecord, vstorage } from "..";
import constants from "../constants";
import { DBSave } from "../types/api/latest";

const UserStore = findByStoreName("UserStore");

interface CloudSyncAPIErrorResponse {
  message: string;
  status: number;
  error?: string;
}
export class CloudSyncAPIError extends Error {
  constructor(resp: CloudSyncAPIErrorResponse) {
    super(
      `${resp.status}: ${resp.message}${resp.error ? ` (${resp.error})` : ""}`,
    );
    this.name = this.constructor.name;
  }
}

export function currentAuthorization(): AuthRecord | undefined {
  return vstorage.auth?.[UserStore.getCurrentUser()?.id];
}
export async function getAuthorization(): Promise<string> {
  const e = new Error("Unauthorized, try logging out and back in again");
  let auth = currentAuthorization();
  if (!auth) throw e;

  if (Date.now() >= auth.expiresAt) {
    const x = await fetch(
      `${
        constants.api
      }api/refresh-access-token?refresh_token=${encodeURIComponent(
        auth.refreshToken,
      )}`,
    );
    if (x.status !== 200) throw new CloudSyncAPIError(await x.json());
    auth = await x.json();

    vstorage.auth ??= {};
    vstorage.auth[UserStore.getCurrentUser().id] = auth;
  }

  return auth.accessToken;
}

export async function getOauth2Response(code: string): Promise<AuthRecord> {
  const res = await fetch(
    `${constants.api}api/get-access-token?code=${encodeURIComponent(code)}`,
  );

  if (res.status === 200) return await res.json();
  else throw new CloudSyncAPIError(await res.json());
}
export async function getSaveData(): Promise<DBSave.Save | undefined> {
  if (!currentAuthorization()) return;

  const res = await fetch(`${constants.api}api/get-data`, {
    headers: {
      authorization: await getAuthorization(),
    },
  });

  if (res.status === 200) return await res.json();
  else throw new CloudSyncAPIError(await res.json());
}
export async function syncSaveData(
  data: DBSave.SaveSync,
): Promise<DBSave.Save | undefined> {
  if (!currentAuthorization()) return;

  const res = await fetch(`${constants.api}api/sync-data`, {
    method: "POST",
    headers: {
      authorization: await getAuthorization(),
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (res.status === 200) return await res.json();
  else throw new CloudSyncAPIError(await res.json());
}
export async function deleteSaveData(): Promise<true | undefined> {
  if (!currentAuthorization()) return;

  const res = await fetch(`${constants.api}api/delete-data`, {
    method: "DELETE",
    headers: {
      authorization: await getAuthorization(),
    },
  });

  if (res.status === 200) return await res.json();
  else throw new CloudSyncAPIError(await res.json());
}

export async function uploadFile(body: string): Promise<
  | {
      key: string;
    }
  | undefined
> {
  if (!currentAuthorization()) return;

  const res = await fetch("https://hst.sh/documents", {
    method: "POST",
    body,
  });

  if (res.status === 200) return await res.json();
  else throw new CloudSyncAPIError(await res.json());
}
