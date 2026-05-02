import Link from "next/link";
import { HomeContent } from "@/components/HomeContent";
import { ProviderRow } from "@/components/ProviderRow";
import { tmdbApi } from "@/lib/tmdb";
import { anilistApi } from "@/lib/anilist";
import { HOME_PROVIDERS } from "@/lib/providers";

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, trendingToday, popularMovies, popularTv, topMovies, topTv, nowPlaying, trendingAnime, popularAnime] =
    await Promise.all([
      tmdbApi.trending("week"),
      tmdbApi.trending("day"),
      tmdbApi.popularMovies(),
      tmdbApi.popularTv(),
      tmdbApi.topRatedMovies(),
      tmdbApi.topRatedTv(),
      tmdbApi.nowPlayingMovies(),
      anilistApi.trending(20).catch(() => []),
      anilistApi.popular(20).catch(() => []),
    ]);

  const providerRows = (
    <>
      <div className="mt-12 px-4 sm:px-6 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">Streaming Exclusives</h2>
        <Link href="/exclusives" className="text-sm text-text-dim hover:text-white">
          See all →
        </Link>
      </div>
      {HOME_PROVIDERS.map((p) => (
        <ProviderRow key={p.slug} provider={p} variant="condensed" />
      ))}
    </>
  );

  return (
    <HomeContent
      initial={{
        trending,
        trendingToday,
        popularMovies,
        popularTv,
        topMovies,
        topTv,
        nowPlaying,
        trendingAnime,
        popularAnime,
      }}
      providerRows={providerRows}
    />
  );
}
