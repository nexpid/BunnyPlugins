import type { Module } from "../stuff/Module";
import BetterComponents from "./BetterComponents";
import Freemix from "./Freemix";
import NoInviteToServers from "./NoInviteToServers";
import RestoreEmojiInfoReaction from "./RestoreEmojiInfoReaction";
import SendSpotifyInvite from "./SendSpotifyInvite";
import SpotifyListenAlong from "./SpotifyListenAlong";
import TenorGifFix from "./TenorGifFix";

export default [
  Freemix,
  TenorGifFix,
  SpotifyListenAlong,
  SendSpotifyInvite,
  NoInviteToServers,
  BetterComponents,
  RestoreEmojiInfoReaction,
] as Module<any>[];
