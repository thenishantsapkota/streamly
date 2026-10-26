import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { apiQuery } from "@/lib/api";

// Page 1 shares its cache entry with the index and home rows.
const pages = [apiQuery("tmdb", "nowPlayingMovies"), apiQuery("tmdb", "nowPlayingMovies", 2), apiQuery("tmdb", "nowPlayingMovies", 3)];

export const Route = createFileRoute("/movies/now-playing")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all(pages.map((p) => queryClient.ensureQueryData(p)));
  },
  head: () => ({
    meta: [
      { title: "Now Playing Movies · Streamly" },
      { name: "description", content: "Movies currently playing in cinemas." },
    ],
    links: [{ rel: "canonical", href: "/movies/now-playing" }],
  }),
  component: NowPlayingPage,
});

function NowPlayingPage() {
  const results = useSuspenseQueries({ queries: pages });
  const items = results.flatMap((r) => r.data.results);

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Now Playing"
        subline="What is showing in cinemas this week."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="movies" />
      </PageHeader>
      <MediaGrid items={items} forceType="movie" />
    </div>
  );
}
