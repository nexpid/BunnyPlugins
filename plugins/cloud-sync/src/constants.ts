import { vstorage } from ".";

const api = "https://cloudsync.nexpid.xyz/";
export default {
  get api() {
    if (vstorage.host)
      return !vstorage.host.endsWith("/") ? `${vstorage.host}/` : vstorage.host;
    else return api;
  },
  raw: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/cloud-sync/",
  oauth2: {
    clientId: "1120793656878714913",
    redirectURL: `${api}api/oauth2-response`,
  },
};
