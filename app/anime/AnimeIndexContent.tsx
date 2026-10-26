"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimeHero } from "@/components/AnimeHero";
import { AnimeRow } from "@/components/AnimeRow";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Reveal } from "@/components/motion";
import { SubtitlesIcon } from "@phosphor-icons/react";
import { anilistClient } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";
import type { Anime } from "@/lib/anilist";

type Props = {
  initial: {
    trending: Anime[];
    popular: Anime[];
    topRated: Anime[];
  };
};

export function AnimeIndexContent({ initial }: Props) {
  const trending = useQuery({
    queryKey: qk.trendingAnime(24),
    queryFn: () => anilistClient.trending(24),
    initialData: initial.trending,
  });
  const popular = useQuery({
    queryKey: qk.popularAnime(24),
    queryFn: () => anilistClient.popular(24),
    initialData: initial.popular,
  });
  const topRated = useQuery({
    queryKey: qk.topRatedAnime(24),
    queryFn: () => anilistClient.topRated(24),
    initialData: initial.topRated,
  });

  return (
    <div className="-mt-16">
      <AnimeHero items={trending.data ?? []} />
      <div className="mx-auto max-w-7xl">
        <Reveal y={12} className="mt-10 flex flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-end md:justify-between">
          <CategoryTabs group="anime" />
          <p className="flex items-center gap-2 pb-2 text-xs text-text-dim sm:text-sm">
            <SubtitlesIcon className="size-4 shrink-0 text-brand" weight="bold" aria-hidden />
            Sub and dub are detected by the player when available.
          </p>
        </Reveal>
        <AnimeRow title="Trending Now" items={trending.data ?? []} viewAllHref="/anime/trending" />
        <AnimeRow title="Most Popular" items={popular.data ?? []} viewAllHref="/anime/popular" />
        <AnimeRow title="Top Rated" items={topRated.data ?? []} viewAllHref="/anime/top-rated" />
      </div>
    </div>
  );
}
