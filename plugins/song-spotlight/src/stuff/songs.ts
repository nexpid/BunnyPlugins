import { API } from "../types/api";

const infoCache = new Map<string, any>();

const getInfo = async (
  service: API.Song["service"],
  type: API.Song["type"],
  id: string,
  signal?: AbortSignal
): Promise<any | false> => {
  const key = `${service}${type}${id}`;
  if (infoCache.has(key)) return infoCache.get(key);

  if (service === "spotify") {
    const res = await (
      await fetch(`https://open.spotify.com/embed/${type}/${id}`, { signal })
    ).text();

    const dt = JSON.parse(
      `{"props"${res.split('{"props"')[1].split("</script>")[0]}`
    );
    infoCache.set(key, dt);
    return dt;
  } else return false;
};

export interface SpotifyEmbedEntityTracklistEntry {
  uri: string;
  uid: string;
  title: string;
  subtitle: string;
  isExplicit: boolean;
  duration: number;
  isPlayable: boolean;
  audioPreview?: {
    format: string;
    url: string;
  };
}
export type SpotifyEmbedEntity =
  | {
      type: "track";
      name: string;
      uri: string;
      id: string;
      title: string;
      artists: {
        name: string;
        uri: string;
      }[];
      coverArt: {
        extractedColors: {
          colorDark: { hex: string };
          colorLight?: { hex: string };
        };
        sources: {
          url: string;
          width: number;
          height: number;
        }[];
      };
      releaseDate: { isoString: string } | null;
      duration: number;
      maxDuration: number;
      isPlayable: boolean;
      isExplicit: boolean;
      audioPreview: {
        url: string;
        format: string;
      };
      hasVideo: boolean;
      relatedEntityUri: string;
    }
  | {
      type: "album" | "playlist";
      name: string;
      uri: string;
      id: string;
      title: string;
      subtitle: string;
      coverArt: {
        extractedColors: {
          colorDark: { hex: string };
          colorLight?: { hex: string };
        };
        sources: {
          url: string;
          width: number;
          height: number;
        }[];
      };
      releaseDate: { isoString: string } | null;
      duration: number;
      maxDuration: number;
      isPlayable: boolean;
      isExplicit: boolean;
      hasVideo: boolean;
      relatedEntityUri: string;
      trackList: SpotifyEmbedEntityTracklistEntry[];
    };

export async function getSongData(
  service: API.Song["service"],
  type: API.Song["type"],
  id: string,
  signal?: AbortSignal
): Promise<SpotifyEmbedEntity | false> {
  if (service === "spotify") {
    const dt = (await getInfo(service, type, id, signal))?.props?.pageProps
      ?.state?.data?.entity;
    return dt?.name && dt?.coverArt ? dt : false;
  } else return false;
}

export async function getSongName(
  service: API.Song["service"],
  type: API.Song["type"],
  id: string,
  signal?: AbortSignal
): Promise<string | false> {
  if (service === "spotify") {
    const dt = await getInfo(service, type, id, signal);
    return dt?.props?.pageProps?.state?.data?.entity?.name ?? false;
  } else return false;
}

export async function validateSong(
  service: API.Song["service"],
  type: API.Song["type"],
  id: string,
  signal?: AbortSignal
): Promise<boolean> {
  if (service === "spotify") {
    return (
      (await getInfo(service, type, id, signal)).page?.props?.status !== 404
    );
  } else return false;
}
