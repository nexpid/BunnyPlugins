let syncTimeout = 0;
export function hsync(run: () => void) {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(run, 1500);
}
