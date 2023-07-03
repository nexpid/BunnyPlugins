export function stringifyTimeDiff(diff: number) {
  const time = Math.abs(Math.floor(diff / 1000));

  const hrs = Math.floor(time / 3600);
  const mins = Math.floor(time / 60) % 60;
  const secs = time % 60;

  return `${hrs ? `${hrs.toString().padStart(2, "0")}:` : ""}${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function parseTimestamp(timestamp: number): number {
  return new Date().setHours(0, 0, 0, 0) + timestamp;
}
