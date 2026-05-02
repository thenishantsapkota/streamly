export type WatchedItem = {
  id: number;
  type: "movie" | "tv" | "anime";
  title: string;
  poster: string | null;
  backdrop: string | null;
  progress: number;
  currentTime: number;
  duration: number;
  season?: number;
  episode?: number;
  updatedAt: number;
};

const KEY = "recently-watched-v1";
const MAX = 50;

function readAll(): WatchedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WatchedItem[];
  } catch {
    return [];
  }
}

function writeAll(items: WatchedItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("recently-watched-updated"));
  } catch {
    // quota exceeded etc — drop silently
  }
}

export function itemKey(item: Pick<WatchedItem, "id" | "type" | "season" | "episode">) {
  if (item.type === "tv") return `tv-${item.id}-s${item.season ?? 0}-e${item.episode ?? 0}`;
  if (item.type === "anime") return `anime-${item.id}-e${item.episode ?? 0}`;
  return `movie-${item.id}`;
}

export function upsertWatched(update: WatchedItem) {
  const all = readAll();
  const k = itemKey(update);
  const filtered = all.filter((i) => itemKey(i) !== k);
  filtered.unshift(update);
  writeAll(filtered.slice(0, MAX));
}

export function getRecentlyWatched(): WatchedItem[] {
  return readAll();
}

export function getWatched(
  id: number,
  type: "movie" | "tv" | "anime",
  season?: number,
  episode?: number,
): WatchedItem | undefined {
  const k = itemKey({ id, type, season, episode });
  return readAll().find((i) => itemKey(i) === k);
}

export function removeWatched(item: Pick<WatchedItem, "id" | "type" | "season" | "episode">) {
  const k = itemKey(item);
  writeAll(readAll().filter((i) => itemKey(i) !== k));
}

export function clearWatched() {
  writeAll([]);
}
