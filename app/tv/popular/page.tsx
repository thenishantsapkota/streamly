import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;
export const metadata = {
  title: "Popular TV Shows",
  description: "Browse the most popular TV shows right now on Streamly.",
  alternates: { canonical: "/tv/popular" },
};

export default async function PopularTvPage() {
  const [p1, p2, p3] = await Promise.all([
    tmdbApi.popularTv(),
    tmdbApi.popularTv(2),
    tmdbApi.popularTv(3),
  ]);
  const items = [...p1.results, ...p2.results, ...p3.results];

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
