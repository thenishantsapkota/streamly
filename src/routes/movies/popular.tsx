import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { apiQuery } from "@/lib/api";

// Page 1 shares its cache entry with the index and home rows.
const pages = [apiQuery("tmdb", "popularMovies"), apiQuery("tmdb", "popularMovies", 2), apiQuery("tmdb", "popularMovies", 3)];

export const Route = createFileRoute("/movies/popular")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all(pages.map((p) => queryClient.ensureQueryData(p)));
  },
  head: () => ({
    meta: [
      { title: "Popular Movies · Streamly" },
      { name: "description", content: "Browse the most popular movies right now on Streamly." },
    ],
    links: [{ rel: "canonical", href: "/movies/popular" }],
  }),
  component: PopularMoviesPage,
});

function PopularMoviesPage() {
  const results = useSuspenseQueries({ queries: pages });
  const items = results.flatMap((r) => r.data.results);

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Popular Movies"
        subline="The films everyone is watching right now."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="movies" />
      </PageHeader>
      <MediaGrid items={items} forceType="movie" />
    </div>
  );
}
