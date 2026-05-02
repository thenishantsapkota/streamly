import { MediaCard } from "@/components/MediaCard";
import { tmdbApi } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const data = query ? await tmdbApi.search(query) : { results: [] };
  const results = data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv");

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
        {results.map((item) => (
          <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  );
}
