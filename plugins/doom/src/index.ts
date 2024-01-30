import { findByStoreName } from "@vendetta/metro";

import { makeStorage } from "$/storage";

const UserStore = findByStoreName("UserStore");

import App from "./components/App";

export const assetsURL =
  "https://raw.githubusercontent.com/nexpid/VendettaDOOM/main/";

export function newGameSuggestionURL() {
  const user = UserStore.getCurrentUser();

  const params = new URLSearchParams({
    title: "[Game Suggestion]: GAME NAME HERE",
    labels: "game suggestion",
    template: "game_suggestion.yml",
    "discord-username": `@${user.username}${
      user.discriminator !== "0" ? `#${user.discriminator}` : ""
    }`,
  });
  return `https://github.com/nexpid/VendettaDOOM/issues/new?${params}`;
}

export const vstorage = makeStorage({
  settings: {
    game: "doom1",
  },
});

export const settings = App;
