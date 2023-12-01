import { vstorage } from ".";

export const defaultRoot = "https://cloudsync.nexpid.xyz/";
export const defaultClientId = "1120793656878714913";

const api = () =>
  vstorage.host
    ? !vstorage.host.endsWith("/")
      ? `${vstorage.host}/`
      : vstorage.host
    : defaultRoot;

export default {
  get api() {
    return api();
  },
  raw: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/cloud-sync/",
  oauth2: {
    get clientId() {
      return vstorage.clientId || defaultClientId;
    },
    get redirectURL() {
      return `${api()}api/oauth2-response`;
    },
  },
};
