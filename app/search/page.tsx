import Link from "next/link";
import { headers } from "next/headers";
import type { SearchResult } from "../api/search/route";

export const dynamic = "force-dynamic";

async function fetchResults(query: string): Promise<SearchResult[]> {
  if (!query) return [];
  // Build an absolute URL from the incoming request so this works in dev,
  // production, and behind proxies without depending on env vars.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  if (!host) return [];
  const url = `${proto}://${host}/api/search?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: SearchResult[] };
    return json.results ?? [];
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = await fetchResults(query);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
      <h1 className="text-2xl font-semibold">
        {query ? <>Results for <span className="text-brand">“{query}”</span></> : "Search"}
      </h1>
      {!query && (
        <p className="mt-2 text-text-dim">
          Type a title in the search bar above to begin.
        </p>
      )}
      {query && results.length === 0 && (
        <p className="mt-4 text-text-dim">No matches found.</p>
      )}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {results.map((r) => (
          <SearchCard key={`${r.kind}-${r.id}`} r={r} />
        ))}
      </div>
    </div>
  );
}

function SearchCard({ r }: { r: SearchResult }) {
  const href = `/${r.kind}/${r.id}`;
  return (
    <Link href={href} className="group relative block">
      <div className="aspect-2/3 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition group-hover:ring-brand/70">
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
        {r.kind === "anime" && (
          <div className="absolute top-2 right-2 rounded-md bg-brand/85 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Anime
          </div>
        )}
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
