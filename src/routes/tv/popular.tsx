import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { apiQuery } from "@/lib/api";

// Page 1 shares its cache entry with the index and home rows.
const pages = [apiQuery("tmdb", "popularTv"), apiQuery("tmdb", "popularTv", 2), apiQuery("tmdb", "popularTv", 3)];

export const Route = createFileRoute("/tv/popular")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all(pages.map((p) => queryClient.ensureQueryData(p)));
  },
  head: () => ({
    meta: [
      { title: "Popular TV Shows · Streamly" },
      { name: "description", content: "Browse the most popular TV shows right now on Streamly." },
    ],
    links: [{ rel: "canonical", href: "/tv/popular" }],
  }),
  component: PopularTvPage,
});

function PopularTvPage() {
  const results = useSuspenseQueries({ queries: pages });
  const items = results.flatMap((r) => r.data.results);

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Popular Series"
        subline="The shows everyone is talking about right now."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="tv" />
      </PageHeader>
      <MediaGrid items={items} forceType="tv" />
    </div>
  );
}
