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
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="px-4 sm:px-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Popular Anime</h1>
          <p className="mt-1 text-text-dim">The most popular anime of all time</p>
        </div>
        <AnimeGrid items={items} />
      </div>
    </div>
  );
}
