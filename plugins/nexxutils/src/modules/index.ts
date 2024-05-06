import type { Module } from "../stuff/Module";
import BetterComponents from "./BetterComponents";
import ColorfulChannels from "./ColorfulChannels";
import NoInviteToServers from "./NoInviteToServers";
import RestoreEmojiInfoReaction from "./RestoreEmojiInfoReaction";
import SendSpotifyInvite from "./SendSpotifyInvite";
import SpotifyListenAlong from "./SpotifyListenAlong";
import TenorGifFix from "./TenorGifFix";

// hook: keep sorted alphabetically
export default [
  BetterComponents,
  ColorfulChannels,
  NoInviteToServers,
  RestoreEmojiInfoReaction,
  SendSpotifyInvite,
  SpotifyListenAlong,
  TenorGifFix,
].sort((a, b) => (a.id < b.id ? -1 : 1)) as Module<any>[];
