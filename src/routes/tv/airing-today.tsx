import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { apiQuery } from "@/lib/api";

// Page 1 shares its cache entry with the index and home rows.
const pages = [apiQuery("tmdb", "airingTodayTv"), apiQuery("tmdb", "airingTodayTv", 2), apiQuery("tmdb", "airingTodayTv", 3)];

export const Route = createFileRoute("/tv/airing-today")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all(pages.map((p) => queryClient.ensureQueryData(p)));
  },
  head: () => ({
    meta: [
      { title: "Airing Today · Streamly" },
      { name: "description", content: "TV shows with new episodes airing today." },
    ],
    links: [{ rel: "canonical", href: "/tv/airing-today" }],
  }),
  component: AiringTodayPage,
});

function AiringTodayPage() {
  const results = useSuspenseQueries({ queries: pages });
  const items = results.flatMap((r) => r.data.results);

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Airing Today"
        subline="Series with a new episode out today."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="tv" />
      </PageHeader>
      <MediaGrid items={items} forceType="tv" />
    </div>
  );
}
