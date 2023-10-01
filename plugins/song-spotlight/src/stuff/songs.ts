import { API } from "../types/api";

const infoCache = new Map<string, any>();

const getInfo = async (
  service: API.Song["service"],
  type: API.Song["type"],
  id: string
): Promise<any | false> => {
  const key = `${service}${type}${id}`;
  if (infoCache.has(key)) return infoCache.get(key);

  if (service === "spotify") {
    const res = await (
      await fetch(`https://open.spotify.com/embed/${type}/${id}`)
    ).text();

    const dt = JSON.parse(
      `{"props"${res.split('{"props"')[1].split("</script>")[0]}`
    );
    infoCache.set(key, dt);
    return dt;
  } else return false;
};

export async function getSongName(
  service: API.Song["service"],
  type: API.Song["type"],
  id: string
): Promise<string | false> {
  if (service === "spotify") {
    const dt = await getInfo(service, type, id);
    return dt?.props?.pageProps?.state?.data?.entity?.name ?? false;
  } else return false;
}

export async function validateSong(
  service: API.Song["service"],
  type: API.Song["type"],
  id: string
): Promise<boolean> {
  if (service === "spotify") {
    return (await getInfo(service, type, id)).page?.props?.status !== 404;
  } else return false;
}
