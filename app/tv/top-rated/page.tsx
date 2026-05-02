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
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="px-4 sm:px-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Top Rated TV Shows</h1>
          <p className="mt-1 text-text-dim">The highest rated TV shows of all time</p>
        </div>
        <MediaGrid items={items} forceType="tv" />
      </div>
    </div>
  );
}
