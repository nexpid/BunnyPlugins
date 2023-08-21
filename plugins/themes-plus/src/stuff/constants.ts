export default {
  iconpacks: {
    list: "https://raw.githubusercontent.com/nexpid/VendettaThemesPlus/main/iconpacks/list.json",
    assets:
      "https://raw.githubusercontent.com/nexpid/VendettaThemesPlus/main/iconpacks/assets/",
    tree: (iconpack: string) =>
      `https://raw.githubusercontent.com/nexpid/VendettaThemesPlus/iconpack-trees/${iconpack}.txt`,
  },
};
