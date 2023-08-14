import { Module } from "../stuff/Module";
import Freemix from "./Freemix";
import NoInviteToServers from "./NoInviteToServers";
import SpotifyListenAlong from "./SpotifyListenAlong";
import TenorGifFix from "./TenorGifFix";
import Test from "./Test";

export default [
  Freemix,
  TenorGifFix,
  SpotifyListenAlong,
  NoInviteToServers,
  Test,
] as Module[];
