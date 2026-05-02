export type WatchlistItem = {
  id: number;
  type: "movie" | "tv" | "anime";
  title: string;
  poster: string | null;
  year: string;
  rating: number;
  addedAt: number;
};

const KEY = "watchlist-v1";

function readAll(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WatchlistItem[];
  } catch {
    return [];
  }
}

function writeAll(items: WatchlistItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("watchlist-updated"));
  } catch {
    /* quota exceeded */
  }
}

export function getWatchlist(): WatchlistItem[] {
  return readAll();
}

export function isInWatchlist(id: number, type: string): boolean {
  return readAll().some((i) => i.id === id && i.type === type);
}

export function addToWatchlist(item: WatchlistItem) {
  const all = readAll();
  if (all.some((i) => i.id === item.id && i.type === item.type)) return;
  all.unshift(item);
  writeAll(all);
}

export function removeFromWatchlist(id: number, type: string) {
  writeAll(readAll().filter((i) => !(i.id === id && i.type === type)));
}

export function toggleWatchlist(item: WatchlistItem): boolean {
  if (isInWatchlist(item.id, item.type)) {
    removeFromWatchlist(item.id, item.type);
    return false;
  }
  addToWatchlist(item);
  return true;
}
