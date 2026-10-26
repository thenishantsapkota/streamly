import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AnimeGrid } from "@/components/AnimeGrid";
import { apiQuery } from "@/lib/api";

const query = apiQuery("anilist", "popular", 50);

export const Route = createFileRoute("/anime/popular")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(query);
  },
  head: () => ({
    meta: [
      { title: "Popular Anime · Streamly" },
      { name: "description", content: "Browse the most popular anime on Streamly." },
    ],
    links: [{ rel: "canonical", href: "/anime/popular" }],
  }),
  component: PopularAnimePage,
});

function PopularAnimePage() {
  const { data: items } = useSuspenseQuery(query);

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Popular Anime"
        subline="The most watched anime of all time."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="anime" />
      </PageHeader>
      <AnimeGrid items={items} />
    </div>
  );
}
