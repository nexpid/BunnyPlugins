import { Module } from "../stuff/Module";
import Freemix from "./Freemix";
import NoInviteToServers from "./NoInviteToServers";
import SpotifyListenAlong from "./SpotifyListenAlong";
import TenorGifFix from "./TenorGifFix";

export default [
  Freemix,
  TenorGifFix,
  SpotifyListenAlong,
  NoInviteToServers,
] as Module[];
