export default {
  iconpacks: {
    list: "https://raw.githubusercontent.com/Gabe616/VendettaThemesPlus/main/iconpacks/list.json",
    assets:
      "https://raw.githubusercontent.com/Gabe616/VendettaThemesPlus/main/iconpacks/assets/",
    repoTree: (user: string) =>
      `https://api.github.com/repos/${user}/git/trees/master?recursive=1`,
    baseRepo: "Gabe616/VendettaThemesPlus",
  },
};
