import { AnimeHero } from "@/components/AnimeHero";
import { AnimeRow } from "@/components/AnimeRow";
import { anilistApi } from "@/lib/anilist";

export const revalidate = 3600;
export const metadata = {
  title: "Anime",
  description: "Browse trending, popular, and top-rated anime on Streamly. Sub & dub auto-detected.",
  alternates: { canonical: "/anime" },
  openGraph: { title: "Anime · Streamly", url: "/anime" },
};

export default async function AnimeIndexPage() {
  const [trending, popular, topRated] = await Promise.all([
    anilistApi.trending(24),
    anilistApi.popular(24),
    anilistApi.topRated(24),
  ]);
  return (
    <div className="-mt-16">
      <AnimeHero items={trending} />
      <div className="mx-auto max-w-7xl">
        <p className="mt-4 px-4 sm:px-6 text-sm text-text-dim">
          Subbed and dubbed versions are auto-detected by the player when available.
        </p>
        <AnimeRow title="Trending Now" items={trending} />
        <AnimeRow title="Most Popular" items={popular} />
        <AnimeRow title="Top Rated" items={topRated} />
      </div>
    </div>
  );
}
