import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { Top10Row } from "@/components/Top10Row";
import { AnimeRow } from "@/components/AnimeRow";
import { ProviderRow } from "@/components/ProviderRow";
import { RecentlyWatched } from "@/components/RecentlyWatched";
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

  const heroItems = trending.results
    .filter((i) => i.backdrop_path && i.overview)
    .slice(0, 10);

  return (
    <div className="-mt-16">
      {heroItems.length > 0 && <Hero items={heroItems} />}
      <div className="mx-auto max-w-7xl">
        <RecentlyWatched />
        <Top10Row title="Top 10 Today" items={trendingToday.results} />
        <Row title="Trending This Week" items={trending.results} viewAllHref="/trending" />
        <Row title="Now Playing" items={nowPlaying.results} forceType="movie" viewAllHref="/movies/now-playing" />
        <Row title="Popular Movies" items={popularMovies.results} forceType="movie" viewAllHref="/movies/popular" />
        <Row title="Popular TV Shows" items={popularTv.results} forceType="tv" viewAllHref="/tv/popular" />

        <div className="mt-12 px-4 sm:px-6 flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">Streaming Exclusives</h2>
          <Link href="/exclusives" className="text-sm text-text-dim hover:text-white">
            See all →
          </Link>
        </div>
        {HOME_PROVIDERS.map((p) => (
          <ProviderRow key={p.slug} provider={p} variant="condensed" />
        ))}

        <AnimeRow title="Trending Anime" items={trendingAnime} viewAllHref="/anime/trending" />
        <AnimeRow title="Popular Anime" items={popularAnime} viewAllHref="/anime/popular" />
        <Row title="Top Rated Movies" items={topMovies.results} forceType="movie" viewAllHref="/movies/top-rated" />
        <Row title="Top Rated TV" items={topTv.results} forceType="tv" viewAllHref="/tv/top-rated" />
      </div>
    </div>
  );
}
