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
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="px-4 sm:px-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Trending Anime</h1>
          <p className="mt-1 text-text-dim">The most talked about anime right now</p>
        </div>
        <AnimeGrid items={items} />
      </div>
    </div>
  );
}
