import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Reveal } from "@/components/motion";
import { apiQuery } from "@/lib/api";

const q = {
  popular: apiQuery("tmdb", "popularTv"),
  topRated: apiQuery("tmdb", "topRatedTv"),
  airing: apiQuery("tmdb", "airingTodayTv"),
};

export const Route = createFileRoute("/tv/")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(q.popular),
      queryClient.ensureQueryData(q.topRated),
      queryClient.ensureQueryData(q.airing),
    ]);
  },
  head: () => ({
    meta: [
      { title: "TV Shows · Streamly" },
      { name: "description", content: "Browse trending, popular, and top-rated TV shows on Streamly." },
      { property: "og:title", content: "TV Shows · Streamly" },
    ],
    links: [{ rel: "canonical", href: "/tv" }],
  }),
  component: TvIndexPage,
});

function TvIndexPage() {
  const [{ data: popular }, { data: topRated }, { data: airing }] = useSuspenseQueries({
    queries: [q.popular, q.topRated, q.airing],
  });

  const heroItems = popular.results
    .filter((i) => i.backdrop_path && i.overview)
    .slice(0, 10)
    .map((i) => ({ ...i, media_type: "tv" as const }));

  return (
    <div className="-mt-16">
      {heroItems.length > 0 && <Hero items={heroItems} label="Popular now" />}
      <div className="mx-auto max-w-7xl">
        <Reveal y={12} className="mt-10 px-4 sm:px-6">
          <CategoryTabs group="tv" />
        </Reveal>
        <Row title="Airing Today" items={airing.results} forceType="tv" viewAllHref="/tv/airing-today" />
        <Row title="Popular" items={popular.results} forceType="tv" viewAllHref="/tv/popular" />
        <Row title="Top Rated" items={topRated.results} forceType="tv" viewAllHref="/tv/top-rated" />
      </div>
    </div>
  );
}
