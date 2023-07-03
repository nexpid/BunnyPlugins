import { SettingsActivity } from "./activity";

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
    buttons: [
      { text: "Join Vendetta", url: "https://discord.gg/vendetta-mod" },
      {
        text: "Install Vendetta",
        url: "https://github.com/vendetta-mod/Vendetta#installing",
      },
    ],
  },
};

export default PresetProfiles;
