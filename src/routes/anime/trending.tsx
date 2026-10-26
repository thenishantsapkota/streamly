import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AnimeGrid } from "@/components/AnimeGrid";
import { apiQuery } from "@/lib/api";

const query = apiQuery("anilist", "trending", 50);

export const Route = createFileRoute("/anime/trending")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(query);
  },
  head: () => ({
    meta: [
      { title: "Trending Anime · Streamly" },
      { name: "description", content: "See what anime is trending right now on Streamly." },
    ],
    links: [{ rel: "canonical", href: "/anime/trending" }],
  }),
  component: TrendingAnimePage,
});

function TrendingAnimePage() {
  const { data: items } = useSuspenseQuery(query);

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Trending Anime"
        subline="The anime people are watching this week."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="anime" />
      </PageHeader>
      <AnimeGrid items={items} />
    </div>
  );
}
