import type { Module } from "../stuff/Module";
import BetterComponents from "./BetterComponents";
import Freemix from "./Freemix";
import NoInviteToServers from "./NoInviteToServers";
import NSFWChannelTag from "./NSFWChannelTag";
import RestoreEmojiInfoReaction from "./RestoreEmojiInfoReaction";
import SendSpotifyInvite from "./SendSpotifyInvite";
import SpotifyListenAlong from "./SpotifyListenAlong";
import TenorGifFix from "./TenorGifFix";
import Wario from "./Wario";

export default [
  Freemix,
  TenorGifFix,
  SpotifyListenAlong,
  SendSpotifyInvite,
  NoInviteToServers,
  BetterComponents,
  RestoreEmojiInfoReaction,
  NSFWChannelTag,
  Wario,
] as Module<any>[];
