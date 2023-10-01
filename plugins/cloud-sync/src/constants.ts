import { vstorage } from ".";

const root = "https://cloudsync.nexpid.xyz/";
export default {
  get api() {
    return vstorage.host
      ? !vstorage.host.endsWith("/")
        ? `${vstorage.host}/`
        : vstorage.host
      : root;
  },
  raw: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/cloud-sync/",
  oauth2: {
    clientId: "1120793656878714913",
    get redirectURL() {
      return `${
        vstorage.host
          ? !vstorage.host.endsWith("/")
            ? `${vstorage.host}/`
            : vstorage.host
          : root
      }api/oauth2-response`;
    },
  },
};
