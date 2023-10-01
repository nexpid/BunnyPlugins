export namespace API {
  export interface Song {
    service: "spotify";
    type: "track" | "album";
    id: string;
  }

  export interface Save {
    user: string;
    songs: (Song | null)[];
  }
}
