import { Module } from "../stuff/Module";
import Freemix from "./Freemix";
import M3Switches from "./M3Switches";
import NoInviteToServers from "./NoInviteToServers";
import SpotifyListenAlong from "./SpotifyListenAlong";
import TenorGifFix from "./TenorGifFix";

export default [
  Freemix,
  TenorGifFix,
  SpotifyListenAlong,
  NoInviteToServers,
  M3Switches,
] as Module[];
