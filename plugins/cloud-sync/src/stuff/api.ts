import { DBSave } from "../types/api/latest";
import { vstorage } from "..";
import constants from "../constants";

interface CloudSyncAPIErrorResponse {
  message: string;
  status: number;
  error?: string;
}
export class CloudSyncError extends Error {
  constructor(resp: CloudSyncAPIErrorResponse) {
    super(
      `${resp.status}: ${resp.message}${resp.error ? ` (${resp.error})` : ""}`
    );
    this.name = this.constructor.name;
  }
}

export async function getOauth2Response(code: string): Promise<string> {
  const res = await fetch(
    `${constants.api}api/oauth2-response?code=${encodeURIComponent(
      code
    )}&vendetta=true`
  );

  if (res.status === 200) return await res.text();
  else throw new CloudSyncError(await res.json());
}
export async function getSaveData(): Promise<DBSave.Save | undefined> {
  if (!vstorage.authorization) return;

  const res = await fetch(`${constants.api}api/get-data`, {
    headers: {
      authorization: vstorage.authorization,
    },
  });

  if (res.status === 200) return await res.json();
  else throw new CloudSyncError(await res.json());
}
export async function syncSaveData(
  data: DBSave.SaveSync
): Promise<DBSave.Save | undefined> {
  if (!vstorage.authorization) return;

  const res = await fetch(`${constants.api}api/sync-data`, {
    method: "POST",
    headers: {
      authorization: vstorage.authorization,
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (res.status === 200) return await res.json();
  else throw new CloudSyncError(await res.json());
}
export async function deleteSaveData(): Promise<true | undefined> {
  if (!vstorage.authorization) return;

  const res = await fetch(`${constants.api}api/delete-data`, {
    method: "DELETE",
    headers: {
      authorization: vstorage.authorization,
    },
  });

  if (res.status === 200) return await res.json();
  else throw new CloudSyncError(await res.json());
}
