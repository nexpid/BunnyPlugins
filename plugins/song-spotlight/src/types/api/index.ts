export namespace API {
  export interface Song {
    service: "spotify";
    type: "track" | "album" | "playlist";
    id: string;
  }

  export interface Save {
    user: string;
    songs: (Song | null)[];
  }
}
