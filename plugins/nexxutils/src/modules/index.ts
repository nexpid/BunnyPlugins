import type { Module } from "../stuff/Module";
import BetterComponents from "./BetterComponents";
import NoInviteToServers from "./NoInviteToServers";
import NSFWChannelTag from "./NSFWChannelTag";
import PluginEmbeds from "./PluginEmbeds";
import RestoreEmojiInfoReaction from "./RestoreEmojiInfoReaction";
import SendSpotifyInvite from "./SendSpotifyInvite";
import SpotifyListenAlong from "./SpotifyListenAlong";
import TenorGifFix from "./TenorGifFix";

// hook: keep sorted alphabetically
export default [
  BetterComponents,
  NSFWChannelTag,
  NoInviteToServers,
  PluginEmbeds,
  RestoreEmojiInfoReaction,
  SendSpotifyInvite,
  SpotifyListenAlong,
  TenorGifFix,
].sort((a, b) => (a.id < b.id ? -1 : 1)) as Module<any>[];
