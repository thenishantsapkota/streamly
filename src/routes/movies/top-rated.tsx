import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { apiQuery } from "@/lib/api";

// Page 1 shares its cache entry with the index and home rows.
const pages = [apiQuery("tmdb", "topRatedMovies"), apiQuery("tmdb", "topRatedMovies", 2), apiQuery("tmdb", "topRatedMovies", 3)];

export const Route = createFileRoute("/movies/top-rated")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all(pages.map((p) => queryClient.ensureQueryData(p)));
  },
  head: () => ({
    meta: [
      { title: "Top Rated Movies · Streamly" },
      { name: "description", content: "The highest rated movies of all time on Streamly." },
    ],
    links: [{ rel: "canonical", href: "/movies/top-rated" }],
  }),
  component: TopRatedMoviesPage,
});

function TopRatedMoviesPage() {
  const results = useSuspenseQueries({ queries: pages });
  const items = results.flatMap((r) => r.data.results);

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Top Rated Movies"
        subline="The highest rated films of all time, by audience score."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="movies" />
      </PageHeader>
      <MediaGrid items={items} forceType="movie" />
    </div>
  );
}
