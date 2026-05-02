import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { AnimeRow } from "@/components/AnimeRow";
import { RecentlyWatched } from "@/components/RecentlyWatched";
import { tmdbApi } from "@/lib/tmdb";
import { anilistApi } from "@/lib/anilist";

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, popularMovies, popularTv, topMovies, topTv, nowPlaying, trendingAnime, popularAnime] =
    await Promise.all([
      tmdbApi.trending("week"),
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
        <Row title="Trending This Week" items={trending.results} />
        <Row title="Now Playing" items={nowPlaying.results} forceType="movie" />
        <Row title="Popular Movies" items={popularMovies.results} forceType="movie" />
        <Row title="Popular TV Shows" items={popularTv.results} forceType="tv" />
        <AnimeRow title="Trending Anime" items={trendingAnime} />
        <AnimeRow title="Popular Anime" items={popularAnime} />
        <Row title="Top Rated Movies" items={topMovies.results} forceType="movie" />
        <Row title="Top Rated TV" items={topTv.results} forceType="tv" />
      </div>
    </div>
  );
}
