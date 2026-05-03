"use client";

import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { Top10Row } from "@/components/Top10Row";
import { AnimeRow } from "@/components/AnimeRow";
import { RecentlyWatched } from "@/components/RecentlyWatched";
import { RandomPick } from "@/components/RandomPick";
import { tmdbClient, anilistClient } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import type { MediaItem } from "@/lib/tmdb";
import type { Anime } from "@/lib/anilist";

type HomeData = {
  trending: { results: MediaItem[] };
  trendingToday: { results: MediaItem[] };
  popularMovies: { results: MediaItem[] };
  popularTv: { results: MediaItem[] };
  topMovies: { results: MediaItem[] };
  topTv: { results: MediaItem[] };
  nowPlaying: { results: MediaItem[] };
  trendingAnime: Anime[];
  popularAnime: Anime[];
  bollywoodMovies: { results: MediaItem[] };
  bollywoodTv: { results: MediaItem[] };
};

export function HomeContent({
  initial,
  providerRows,
}: {
  initial: HomeData;
  providerRows: React.ReactNode;
}) {
  const trending = useQuery({
    queryKey: qk.trending("week"),
    queryFn: () => tmdbClient.trending("week"),
    initialData: initial.trending,
  });
  const trendingToday = useQuery({
    queryKey: qk.trending("day"),
    queryFn: () => tmdbClient.trending("day"),
    initialData: initial.trendingToday,
  });
  const popularMovies = useQuery({
    queryKey: qk.popularMovies(),
    queryFn: () => tmdbClient.popularMovies(),
    initialData: initial.popularMovies,
  });
  const popularTv = useQuery({
    queryKey: qk.popularTv(),
    queryFn: () => tmdbClient.popularTv(),
    initialData: initial.popularTv,
  });
  const topMovies = useQuery({
    queryKey: qk.topRatedMovies(),
    queryFn: () => tmdbClient.topRatedMovies(),
    initialData: initial.topMovies,
  });
  const topTv = useQuery({
    queryKey: qk.topRatedTv(),
    queryFn: () => tmdbClient.topRatedTv(),
    initialData: initial.topTv,
  });
  const nowPlaying = useQuery({
    queryKey: qk.nowPlayingMovies(),
    queryFn: () => tmdbClient.nowPlayingMovies(),
    initialData: initial.nowPlaying,
  });
  const trendingAnime = useQuery({
    queryKey: qk.trendingAnime(),
    queryFn: () => anilistClient.trending(20),
    initialData: initial.trendingAnime,
  });
  const popularAnime = useQuery({
    queryKey: qk.popularAnime(),
    queryFn: () => anilistClient.popular(20),
    initialData: initial.popularAnime,
  });
  const bollywoodMovies = useQuery({
    queryKey: qk.bollywoodMovies(),
    queryFn: () => tmdbClient.discoverByCountry("movie", "IN"),
    initialData: initial.bollywoodMovies,
  });
  const bollywoodTv = useQuery({
    queryKey: qk.bollywoodTv(),
    queryFn: () => tmdbClient.discoverByCountry("tv", "IN"),
    initialData: initial.bollywoodTv,
  });

  const heroItems = (trending.data?.results ?? [])
    .filter((i) => i.backdrop_path && i.overview)
    .slice(0, 10);

  return (
    <div className="-mt-16">
      {heroItems.length > 0 && <Hero items={heroItems} />}
      <div className="mx-auto max-w-7xl">
        <RecentlyWatched />
        <div className="mt-6 px-4 sm:px-6">
          <RandomPick />
        </div>
        <Top10Row title="Top 10 Today" items={trendingToday.data?.results ?? []} />
        <Row title="Trending This Week" items={trending.data?.results ?? []} viewAllHref="/trending" />
        <Row title="Now Playing" items={nowPlaying.data?.results ?? []} forceType="movie" viewAllHref="/movies/now-playing" />
        <Row title="Popular Movies" items={popularMovies.data?.results ?? []} forceType="movie" viewAllHref="/movies/popular" />
        <Row title="Popular TV Shows" items={popularTv.data?.results ?? []} forceType="tv" viewAllHref="/tv/popular" />

        <Row title="Bollywood Movies" items={bollywoodMovies.data?.results ?? []} forceType="movie" viewAllHref="/country/IN" />
        <Row title="Indian TV Shows" items={bollywoodTv.data?.results ?? []} forceType="tv" viewAllHref="/country/IN" />

        {providerRows}

        <AnimeRow title="Trending Anime" items={trendingAnime.data ?? []} viewAllHref="/anime/trending" />
        <AnimeRow title="Popular Anime" items={popularAnime.data ?? []} viewAllHref="/anime/popular" />
        <Row title="Top Rated Movies" items={topMovies.data?.results ?? []} forceType="movie" viewAllHref="/movies/top-rated" />
        <Row title="Top Rated TV" items={topTv.data?.results ?? []} forceType="tv" viewAllHref="/tv/top-rated" />
      </div>
    </div>
  );
}
