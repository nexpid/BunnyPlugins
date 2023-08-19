export default {
  iconpacks: {
    list: "https://raw.githubusercontent.com/Gabe616/VendettaThemesPlus/main/iconpacks/list.json",
    assets:
      "https://raw.githubusercontent.com/Gabe616/VendettaThemesPlus/main/iconpacks/assets/",
    tree: (iconpack: string) =>
      `https://raw.githubusercontent.com/Gabe616/VendettaThemesPlus/iconpack-trees/${iconpack}.txt`,
  },
};
