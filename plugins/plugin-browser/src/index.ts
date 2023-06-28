import { fetchPlugin, startPlugin, stopPlugin } from "@vendetta/plugins";
import patcher from "./stuff/patcher";
import { findByProps, findByStoreName } from "@vendetta/metro";

const UserStore = findByStoreName("UserStore");
const { showUserProfile } = findByProps("showUserProfile");
const { fetchProfile } = findByProps("fetchProfile");

export async function refetchPlugin(plugin: any) {
  const enab = plugin.enabled;
  for (let i = 0; i < 2; i++) {
    if (enab) stopPlugin(plugin.id, false);
    await fetchPlugin(plugin.id);
    if (enab) await startPlugin(plugin.id);
  }
}

export async function openProfile(id: string) {
  if (!UserStore.getUser(id)) await fetchProfile(id);
  showUserProfile({ userId: id });
}

let unpatch;
export default {
  onLoad: () => (unpatch = patcher()),
  onUnload: () => unpatch?.(),
};
