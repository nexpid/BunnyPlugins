export default {
  iconpacks: {
    list: "https://raw.githubusercontent.com/nexpid/ThemesPlus/main/iconpacks/list.json",
    assets:
      "https://raw.githubusercontent.com/nexpid/ThemesPlus/main/iconpacks/assets/",
    tree: (iconpack: string) =>
      `https://raw.githubusercontent.com/nexpid/ThemesPlus/iconpack-trees/${iconpack}.txt`,
  },
};
