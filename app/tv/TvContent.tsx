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
    airing: { results: MediaItem[] };
  };
};

export function TvContent({ initial }: Props) {
  const popular = useQuery({
    queryKey: qk.popularTv(),
    queryFn: () => tmdbClient.popularTv(),
    initialData: initial.popular,
  });
  const topRated = useQuery({
    queryKey: qk.topRatedTv(),
    queryFn: () => tmdbClient.topRatedTv(),
    initialData: initial.topRated,
  });
  const airing = useQuery({
    queryKey: qk.airingTodayTv(),
    queryFn: () => tmdbClient.airingTodayTv(),
    initialData: initial.airing,
  });

  const heroItems = (popular.data?.results ?? [])
    .filter((i) => i.backdrop_path && i.overview)
    .slice(0, 10)
    .map((i) => ({ ...i, media_type: "tv" as const }));

  return (
    <div className="-mt-16">
      {heroItems.length > 0 && <Hero items={heroItems} />}
      <div className="mx-auto max-w-7xl">
        <Row title="Airing Today" items={airing.data?.results ?? []} forceType="tv" viewAllHref="/tv/airing-today" />
        <Row title="Popular" items={popular.data?.results ?? []} forceType="tv" viewAllHref="/tv/popular" />
        <Row title="Top Rated" items={topRated.data?.results ?? []} forceType="tv" viewAllHref="/tv/top-rated" />
      </div>
    </div>
  );
}
