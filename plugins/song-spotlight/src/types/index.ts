import { API } from "./api";

export type EditableSong = API.Song & {
  id: string | null;
};
