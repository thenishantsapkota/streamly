"use client";

import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { tmdbClient } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import type { MediaItem } from "@/lib/tmdb";

type Props = {
  initial: {
    popular: { results: MediaItem[] };
    topRated: { results: MediaItem[] };
    nowPlaying: { results: MediaItem[] };
  };
};

export function MoviesContent({ initial }: Props) {
  const popular = useQuery({
    queryKey: qk.popularMovies(),
    queryFn: () => tmdbClient.popularMovies(),
    initialData: initial.popular,
  });
  const topRated = useQuery({
    queryKey: qk.topRatedMovies(),
    queryFn: () => tmdbClient.topRatedMovies(),
    initialData: initial.topRated,
  });
  const nowPlaying = useQuery({
    queryKey: qk.nowPlayingMovies(),
    queryFn: () => tmdbClient.nowPlayingMovies(),
    initialData: initial.nowPlaying,
  });

  const heroItems = (popular.data?.results ?? [])
    .filter((i) => i.backdrop_path && i.overview)
    .slice(0, 10)
    .map((i) => ({ ...i, media_type: "movie" as const }));

  return (
    <div className="-mt-16">
      {heroItems.length > 0 && <Hero items={heroItems} />}
      <div className="mx-auto max-w-7xl">
        <Row title="Now Playing" items={nowPlaying.data?.results ?? []} forceType="movie" viewAllHref="/movies/now-playing" />
        <Row title="Popular" items={popular.data?.results ?? []} forceType="movie" viewAllHref="/movies/popular" />
        <Row title="Top Rated" items={topRated.data?.results ?? []} forceType="movie" viewAllHref="/movies/top-rated" />
      </div>
    </div>
  );
}
