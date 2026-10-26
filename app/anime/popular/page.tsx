import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AnimeGrid } from "@/components/AnimeGrid";
import { anilistApi } from "@/lib/anilist";

export const revalidate = 3600;
export const metadata = {
  title: "Popular Anime",
  description: "Browse the most popular anime on Streamly.",
  alternates: { canonical: "/anime/popular" },
};

export default async function PopularAnimePage() {
  const items = await anilistApi.popular(50);

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
