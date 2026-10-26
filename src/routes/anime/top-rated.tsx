import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AnimeGrid } from "@/components/AnimeGrid";
import { apiQuery } from "@/lib/api";

const query = apiQuery("anilist", "topRated", 50);

export const Route = createFileRoute("/anime/top-rated")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(query);
  },
  head: () => ({
    meta: [
      { title: "Top Rated Anime · Streamly" },
      { name: "description", content: "The highest rated anime of all time on Streamly." },
    ],
    links: [{ rel: "canonical", href: "/anime/top-rated" }],
  }),
  component: TopRatedAnimePage,
});

function TopRatedAnimePage() {
  const { data: items } = useSuspenseQuery(query);

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Top Rated Anime"
        subline="The highest scored anime of all time."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="anime" />
      </PageHeader>
      <AnimeGrid items={items} />
    </div>
  );
}
