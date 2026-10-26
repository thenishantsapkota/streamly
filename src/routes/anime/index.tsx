import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { SubtitlesIcon } from "@phosphor-icons/react";
import { AnimeHero } from "@/components/AnimeHero";
import { AnimeRow } from "@/components/AnimeRow";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Reveal } from "@/components/motion";
import { apiQuery } from "@/lib/api";

const q = {
  trending: apiQuery("anilist", "trending", 24),
  popular: apiQuery("anilist", "popular", 24),
  topRated: apiQuery("anilist", "topRated", 24),
};

export const Route = createFileRoute("/anime/")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(q.trending),
      queryClient.ensureQueryData(q.popular),
      queryClient.ensureQueryData(q.topRated),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Anime · Streamly" },
      {
        name: "description",
        content: "Browse trending, popular, and top-rated anime on Streamly. Sub & dub auto-detected.",
      },
      { property: "og:title", content: "Anime · Streamly" },
    ],
    links: [{ rel: "canonical", href: "/anime" }],
  }),
  component: AnimeIndexPage,
});

function AnimeIndexPage() {
  const [{ data: trending }, { data: popular }, { data: topRated }] = useSuspenseQueries({
    queries: [q.trending, q.popular, q.topRated],
  });

  return (
    <div className="-mt-16">
      <AnimeHero items={trending} />
      <div className="mx-auto max-w-7xl">
        <Reveal y={12} className="mt-10 flex flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-end md:justify-between">
          <CategoryTabs group="anime" />
          <p className="flex items-center gap-2 pb-2 text-xs text-text-dim sm:text-sm">
            <SubtitlesIcon className="size-4 shrink-0 text-brand" weight="bold" aria-hidden />
            Sub and dub are detected by the player when available.
          </p>
        </Reveal>
        <AnimeRow title="Trending Now" items={trending} viewAllHref="/anime/trending" />
        <AnimeRow title="Most Popular" items={popular} viewAllHref="/anime/popular" />
        <AnimeRow title="Top Rated" items={topRated} viewAllHref="/anime/top-rated" />
      </div>
    </div>
  );
}
