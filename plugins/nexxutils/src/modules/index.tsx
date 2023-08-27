import { Module } from "../stuff/Module";
import Freemix from "./Freemix";
import M3UI from "./M3UI";
import NoInviteToServers from "./NoInviteToServers";
import SendSpotifyInvite from "./SendSpotifyInvite";
import SpotifyListenAlong from "./SpotifyListenAlong";
import TenorGifFix from "./TenorGifFix";

export default [
  Freemix,
  TenorGifFix,
  SpotifyListenAlong,
  SendSpotifyInvite,
  NoInviteToServers,
  M3UI,
] as Module[];
