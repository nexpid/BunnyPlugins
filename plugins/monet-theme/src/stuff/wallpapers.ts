export interface Collection {
  label: string;
  variant: "dark" | "light" | "any";
  content: {
    title: string;
    url: string;
  }[];
}

export default <Collection[]>[
  {
    label: "Pixel 4 XL",
    variant: "any",
    content: [
      {
        title: "Cinnamon",
        url: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/monet-theme/assets/backgrounds/pixel4l/cinnamon.png",
      },
      {
        title: "Default",
        url: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/monet-theme/assets/backgrounds/pixel4l/default.png",
      },
      {
        title: "Green",
        url: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/monet-theme/assets/backgrounds/pixel4l/green.png",
      },
      {
        title: "Ocean",
        url: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/monet-theme/assets/backgrounds/pixel4l/ocean.png",
      },
      {
        title: "Orchid",
        url: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/monet-theme/assets/backgrounds/pixel4l/orchid.png",
      },
      {
        title: "Purple",
        url: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/monet-theme/assets/backgrounds/pixel4l/purple.png",
      },
      {
        title: "Space",
        url: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/monet-theme/assets/backgrounds/pixel4l/space.png",
      },
      {
        title: "White",
        url: "https://raw.githubusercontent.com/nexpid/VendettaPlugins/main/plugins/monet-theme/assets/backgrounds/pixel4l/white.png",
      },
    ],
  },
];
