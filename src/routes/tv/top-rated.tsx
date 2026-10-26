import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { apiQuery } from "@/lib/api";

// Page 1 shares its cache entry with the index and home rows.
const pages = [apiQuery("tmdb", "topRatedTv"), apiQuery("tmdb", "topRatedTv", 2), apiQuery("tmdb", "topRatedTv", 3)];

export const Route = createFileRoute("/tv/top-rated")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all(pages.map((p) => queryClient.ensureQueryData(p)));
  },
  head: () => ({
    meta: [
      { title: "Top Rated TV Shows · Streamly" },
      { name: "description", content: "The highest rated TV shows of all time on Streamly." },
    ],
    links: [{ rel: "canonical", href: "/tv/top-rated" }],
  }),
  component: TopRatedTvPage,
});

function TopRatedTvPage() {
  const results = useSuspenseQueries({ queries: pages });
  const items = results.flatMap((r) => r.data.results);

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Top Rated Series"
        subline="The highest rated shows of all time, by audience score."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="tv" />
      </PageHeader>
      <MediaGrid items={items} forceType="tv" />
    </div>
  );
}
