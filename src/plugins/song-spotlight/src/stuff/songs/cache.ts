const previewUrls = Symbol.for("songspotlight.previews");
window[previewUrls] ??= {};

export function getDownloadedPreview(url: string) {
    return window[previewUrls][url];
}

const didDownYet = new Set<string>();
export async function downloadPreviewURL(url: string) {
    if (window[previewUrls][url] || didDownYet.has(url)) return false;
    didDownYet.add(url);

    const res = await fetch(url);
    const type = res.headers.get("content-type") ?? "audio/mpeg";
    const uri = `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;

    window[previewUrls][url] = uri;
    return true;
}
