import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AnimeGrid } from "@/components/AnimeGrid";
import { anilistApi } from "@/lib/anilist";

export const revalidate = 3600;
export const metadata = {
  title: "Top Rated Anime",
  description: "The highest rated anime of all time on Streamly.",
  alternates: { canonical: "/anime/top-rated" },
};

export default async function TopRatedAnimePage() {
  const items = await anilistApi.topRated(50);

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
