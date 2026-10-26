import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AnimeGrid } from "@/components/AnimeGrid";
import { anilistApi } from "@/lib/anilist";

export const revalidate = 3600;
export const metadata = {
  title: "Trending Anime",
  description: "See what anime is trending right now on Streamly.",
  alternates: { canonical: "/anime/trending" },
};

export default async function TrendingAnimePage() {
  const items = await anilistApi.trending(50);

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
