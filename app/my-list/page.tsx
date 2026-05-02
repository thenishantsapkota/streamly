"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from "@/lib/watchlist";

export default function MyListPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const refresh = () => setItems(getWatchlist());
    refresh();
    window.addEventListener("watchlist-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("watchlist-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">My List</h1>
          <p className="mt-1 text-text-dim">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">My List</h1>
        <p className="mt-1 text-text-dim mb-8">
          {items.length === 0
            ? "Your list is empty. Browse and add titles you want to watch later."
            : `${items.length} title${items.length === 1 ? "" : "s"} saved`}
        </p>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-16 text-text-dim/40 mb-4">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-text-dim mb-4">Add movies, TV shows, and anime to your list</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-5 py-2.5 text-sm font-semibold text-white transition"
            >
              Browse content
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {items.map((item) => {
              const href = `/${item.type}/${item.id}`;
              return (
                <div key={`${item.type}-${item.id}`} className="group relative">
                  <Link href={href} className="block">
                    <div className="aspect-2/3 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition group-hover:ring-brand/70">
                      {item.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-text-dim">
                          No image
                        </div>
                      )}
                      {item.rating > 0 && (
                        <div className="absolute top-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium backdrop-blur">
                          ★ {item.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 px-0.5">
                      <div className="line-clamp-1 text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-text-dim">
                        {item.year} · {item.type === "movie" ? "Movie" : item.type === "tv" ? "TV" : "Anime"}
                      </div>
                    </div>
                  </Link>
                  <button
                    aria-label={`Remove ${item.title} from list`}
                    onClick={() => {
                      removeFromWatchlist(item.id, item.type);
                      setItems(getWatchlist());
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
        )}
      </div>
    </div>
  );
}
