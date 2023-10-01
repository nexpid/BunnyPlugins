import { vstorage } from ".";

const root = "https://songspotlight.nexpid.xyz/";
export default {
  get api() {
    return vstorage.host
      ? !vstorage.host.endsWith("/")
        ? `${vstorage.host}/`
        : vstorage.host
      : root;
  },
  oauth2: {
    clientId: "1157745434140344321",
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
