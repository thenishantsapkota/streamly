"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentlyWatched, removeWatched, clearWatched, type WatchedItem } from "@/lib/storage";
import { toast } from "@/components/Toast";

export default function HistoryPage() {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const refresh = () => setItems(getRecentlyWatched());
    refresh();
    window.addEventListener("recently-watched-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("recently-watched-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="pt-24 pb-12 mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Watch History</h1>
        <p className="mt-1 text-text-dim">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Watch History</h1>
            <p className="mt-1 text-text-dim">
              {items.length === 0
                ? "Nothing here yet. Start watching something!"
                : `${items.length} item${items.length === 1 ? "" : "s"} in history`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearWatched();
                setItems([]);
                toast("Watch history cleared");
              }}
              className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-dim hover:text-white hover:bg-surface-2 transition"
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-16 text-text-dim/40 mb-4">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-text-dim mb-4">Your watch history will appear here</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-5 py-2.5 text-sm font-semibold text-white transition"
            >
              Browse content
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((it) => {
              let href = `/${it.type}/${it.id}`;
              if (it.type === "tv" && it.season && it.episode) {
                href = `/tv/${it.id}/watch?s=${it.season}&e=${it.episode}`;
              } else if (it.type === "anime" && it.episode) {
                href = `/anime/${it.id}/watch?e=${it.episode}`;
              }
              const pct = Math.min(100, Math.max(0, Math.round(it.progress)));
              const date = new Date(it.updatedAt);
              const timeAgo = getTimeAgo(date);

              return (
                <div
                  key={`${it.type}-${it.id}-${it.season}-${it.episode}`}
                  className="group flex gap-4 rounded-lg border border-border bg-surface p-3 transition hover:bg-surface-2"
                >
                  <Link href={href} className="relative w-32 sm:w-40 shrink-0">
                    <div className="relative aspect-video overflow-hidden rounded-md bg-surface-2">
                      {it.backdrop ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.backdrop} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-text-dim">
                          No image
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="rounded-full bg-white/90 p-1.5 text-black">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
                        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={href}>
                      <div className="text-sm font-medium hover:text-brand transition">{it.title}</div>
                    </Link>
                    <div className="text-xs text-text-dim mt-0.5">
                      {it.type === "tv" && it.season && it.episode
                        ? `S${it.season} · E${it.episode}`
                        : it.type === "anime" && it.episode
                          ? `Episode ${it.episode}`
                          : it.type === "movie"
                            ? "Movie"
                            : ""}
                      {" · "}
                      {pct}% watched
                      {" · "}
                      {timeAgo}
                    </div>
                  </div>
                  <button
                    aria-label="Remove from history"
                    onClick={() => {
                      removeWatched(it);
                      setItems(getRecentlyWatched());
                      toast("Removed from history");
                    }}
                    className="self-center shrink-0 rounded-full p-2 text-text-dim opacity-0 group-hover:opacity-100 hover:bg-surface hover:text-white transition"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
