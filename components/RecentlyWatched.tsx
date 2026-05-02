"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentlyWatched, removeWatched, type WatchedItem } from "@/lib/storage";

export function RecentlyWatched() {
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

  if (!mounted || items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-3 px-4 sm:px-6 text-lg font-semibold tracking-tight">Continue Watching</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 sm:px-6 pb-2">
        {items.map((it) => {
          let href = `/${it.type}/${it.id}`;
          if (it.type === "tv" && it.season && it.episode) {
            href = `/tv/${it.id}/watch?s=${it.season}&e=${it.episode}`;
          } else if (it.type === "anime" && it.episode) {
            href = `/anime/${it.id}/watch?e=${it.episode}`;
          }
          const pct = Math.min(100, Math.max(0, Math.round(it.progress)));
          return (
            <div key={`${it.type}-${it.id}-${it.season}-${it.episode}`} className="group relative w-[280px] shrink-0">
              <Link href={href} className="block">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition group-hover:ring-brand/70">
                  {it.backdrop ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.backdrop}
                      alt={it.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-text-dim">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <div className="rounded-full bg-white/90 p-3 text-black">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
                    <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-sm font-medium">{it.title}</div>
                    <div className="text-xs text-text-dim">
                      {it.type === "tv" && it.season && it.episode
                        ? `S${it.season} · E${it.episode} · ${pct}% watched`
                        : it.type === "anime" && it.episode
                          ? `Anime · E${it.episode} · ${pct}% watched`
                          : `${pct}% watched`}
                    </div>
                  </div>
                </div>
              </Link>
              <button
                aria-label="Remove from recently watched"
                onClick={() => {
                  removeWatched(it);
                  setItems(getRecentlyWatched());
                }}
                className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 backdrop-blur transition hover:bg-black group-hover:opacity-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
