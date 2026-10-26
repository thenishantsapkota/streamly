import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;
export const metadata = {
  title: "Airing Today",
  description: "TV shows with new episodes airing today.",
  alternates: { canonical: "/tv/airing-today" },
};

export default async function AiringTodayPage() {
  const [p1, p2, p3] = await Promise.all([
    tmdbApi.airingTodayTv(),
    tmdbApi.airingTodayTv(2),
    tmdbApi.airingTodayTv(3),
  ]);
  const items = [...p1.results, ...p2.results, ...p3.results];

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
