import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;
export const metadata = {
  title: "Top Rated TV Shows",
  description: "The highest rated TV shows of all time on Streamly.",
  alternates: { canonical: "/tv/top-rated" },
};

export default async function TopRatedTvPage() {
  const [p1, p2, p3] = await Promise.all([
    tmdbApi.topRatedTv(),
    tmdbApi.topRatedTv(2),
    tmdbApi.topRatedTv(3),
  ]);
  const items = [...p1.results, ...p2.results, ...p3.results];

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
