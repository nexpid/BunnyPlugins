export function addToStyle(x: any, y: any) {
  x.style ??= [];
  if (!Array.isArray(x.style)) x.style = [x.style];
  x.style = x.style.concat(y);
}
