export const baseCdn = "https://cdn.discordapp.com/";
export function cdnFormatAnimated(x: string) {
  return `${x}.${animatedFileType(x)}?size=4096`;
}
export function animatedFileType(x: string) {
  return x.startsWith("a_") ? "gif" : "png";
}
