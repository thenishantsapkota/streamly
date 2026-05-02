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
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="px-4 sm:px-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Airing Today</h1>
          <p className="mt-1 text-text-dim">TV shows with new episodes airing today</p>
        </div>
        <MediaGrid items={items} forceType="tv" />
      </div>
    </div>
  );
}
