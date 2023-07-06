import { ActivityType, SettingsActivity } from "./activity";

//! for some reason the compiler breaks here and doesn't recognize ActivityType
const PresetProfiles: Record<string, SettingsActivity> = {
  "Vendetta Advertisement": {
    state: "Join Now",
    details: '"The best Discord client for mobile"',
    app: { name: "Vendetta" },
    timestamps: {},
    assets: {
      largeImg:
        "mp:external/t88vNcbCl2anXnBX4gmLVep17K_yqL4L2pvzwPMGtjs/%3Fsize%3D512/https/cdn.discordapp.com/icons/1015931589865246730/5b7f29e9c670fbcbf476b4d88fbd081f.png",
    },
    type: 3,
    buttons: [
      { text: "Join Vendetta", url: "https://discord.gg/vendetta-mod" },
      {
        text: "Install Vendetta",
        url: "https://github.com/vendetta-mod/Vendetta#installing",
      },
    ],
  },
  "Scuffed Spotify Activity": {
    timestamps: {
      start: "spotify.track.start",
      end: "spotify.track.end",
    },
    assets: {
      smallImg: "user.avatar",
      largeImg: "spotify.album",
    },
    buttons: [
      {
        text: "Listen Along",
        url: "{spotify.track.url}",
      },
    ],
    app: {
      name: "{spotify.track}",
    },
    type: 2,
    details: "by {spotify.artist}",
    state: "on {spotify.album}",
  },
  "My Profile": {
    timestamps: {
      start: 0,
    },
    assets: {
      largeImg: "user.avatar",
      smallImg: "user.presence",
    },
    buttons: [],
    app: {
      name: "{user.displayname}",
    },
    type: 3,
    details: "{user.name}",
    state: "{user.status}",
  },
};

export default PresetProfiles;
