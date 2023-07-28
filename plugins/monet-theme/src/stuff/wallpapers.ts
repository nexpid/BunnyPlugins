export interface Collection {
  label: string;
  variant: "dark" | "light" | "any";
  content: {
    title: string;
    url: string;
  }[];
}

// i manually typed this out
export default <Collection[]>[
  {
    label: "Pixel 4 XL",
    variant: "any",
    content: [
      {
        title: "Cinnamon",
        url: "https://media.discordapp.net/attachments/919655852724604978/1134393927076687912/cinnamon.png",
      },
      {
        title: "Default",
        url: "https://media.discordapp.net/attachments/919655852724604978/1134393927324160080/default.png",
      },
      {
        title: "Green",
        url: "https://media.discordapp.net/attachments/919655852724604978/1134393927663882281/green.png",
      },
      {
        title: "Ocean",
        url: "https://media.discordapp.net/attachments/919655852724604978/1134393927928139848/ocean.png",
      },
      {
        title: "Orchid",
        url: "https://media.discordapp.net/attachments/919655852724604978/1134393928200753152/orchid.png",
      },
      {
        title: "Purple",
        url: "https://media.discordapp.net/attachments/919655852724604978/1134393928427253840/purple.png",
      },
      {
        title: "Space",
        url: "https://media.discordapp.net/attachments/919655852724604978/1134393928779567124/space.png",
      },
      {
        title: "White",
        url: "https://media.discordapp.net/attachments/919655852724604978/1134393929064787978/white.png",
      },
    ],
  },
];
