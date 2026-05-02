"use client";

import { useEffect, useState } from "react";
import { isInWatchlist, toggleWatchlist, type WatchlistItem } from "@/lib/watchlist";

type Props = {
  item: WatchlistItem;
  className?: string;
};

export function WatchlistButton({ item, className = "" }: Props) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isInWatchlist(item.id, item.type));
    const refresh = () => setSaved(isInWatchlist(item.id, item.type));
    window.addEventListener("watchlist-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("watchlist-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [item.id, item.type]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from My List" : "Add to My List"}
      onClick={() => {
        const nowSaved = toggleWatchlist(item);
        setSaved(nowSaved);
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        saved
          ? "border-brand bg-brand/15 text-white"
          : "border-border bg-surface hover:bg-surface-2 text-text-dim hover:text-white"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="size-4"
      >
        {saved ? (
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {saved ? "In My List" : "My List"}
    </button>
  );
}
