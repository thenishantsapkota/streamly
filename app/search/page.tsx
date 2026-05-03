"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

type SearchResult = {
  id: number;
  kind: "movie" | "tv" | "anime";
  title: string;
  poster: string | null;
  rating: number;
  year: string;
  label: string;
};

type TabKey = "all" | "movie" | "tv" | "anime";
const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "movie", label: "Movies" },
  { key: "tv", label: "TV Shows" },
  { key: "anime", label: "Anime" },
];

function SearchInner() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");

  useEffect(() => {
    if (!query) { setResults([]); return; }
    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { setResults(d.results ?? []); setLoading(false); })
      .catch(() => setLoading(false));
    return () => ctrl.abort();
  }, [query]);

  const filtered = tab === "all" ? results : results.filter((r) => r.kind === tab);

  const counts: Record<TabKey, number> = {
    all: results.length,
    movie: results.filter((r) => r.kind === "movie").length,
    tv: results.filter((r) => r.kind === "tv").length,
    anime: results.filter((r) => r.kind === "anime").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
      <h1 className="text-2xl font-semibold">
        {query ? <>Results for <span className="text-brand">&ldquo;{query}&rdquo;</span></> : "Search"}
      </h1>

      {!query && (
        <p className="mt-2 text-text-dim">
          Type a title in the search bar above to begin.
        </p>
      )}

      {query && results.length > 0 && (
        <div className="mt-4 flex gap-1 rounded-full border border-border bg-surface p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-brand text-white"
                  : "text-text-dim hover:text-white"
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span className="ml-1.5 text-xs opacity-60">{counts[t.key]}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="shimmer aspect-2/3 rounded-lg" />
              <div className="shimmer mt-2 h-4 w-3/4 rounded" />
              <div className="shimmer mt-1 h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && query && filtered.length === 0 && (
        <div className="mt-12 flex flex-col items-center text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-16 text-text-dim/30 mb-3">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <p className="text-text-dim">
            {tab === "all"
              ? "No matches found."
              : `No ${TABS.find((t) => t.key === tab)?.label.toLowerCase()} found. Try "All" tab.`}
          </p>
        </div>
      )}

      {!loading && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((r) => (
            <SearchCard key={`${r.kind}-${r.id}`} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchCard({ r }: { r: SearchResult }) {
  const href = `/${r.kind}/${r.id}`;
  return (
    <Link href={href} className="group relative block transition-transform duration-200 hover:-translate-y-1">
      <div className="aspect-2/3 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition-shadow duration-200 group-hover:ring-brand/70 group-hover:shadow-lg group-hover:shadow-black/40">
        {r.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.poster}
            alt={r.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-dim">
            No image
          </div>
        )}
        {r.rating > 0 && (
          <div className="absolute top-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium backdrop-blur">
            ★ {r.rating.toFixed(1)}
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-md bg-surface/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
          {r.kind === "anime" ? "Anime" : r.kind === "tv" ? "TV" : "Movie"}
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-2.5 shadow-lg text-black">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <div className="line-clamp-1 text-sm font-medium">{r.title}</div>
        <div className="text-xs text-text-dim">
          {r.label}
          {r.year ? ` · ${r.year}` : ""}
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <div className="shimmer h-8 w-48 rounded" />
      </div>
    }>
      <SearchInner />
    </Suspense>
  );
}
