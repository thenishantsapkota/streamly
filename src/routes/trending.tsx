import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { Top10Row } from "@/components/Top10Row";
import { apiQuery } from "@/lib/api";

const q = {
  trendingAll: apiQuery("tmdb", "trending", "week"),
  trendingDay: apiQuery("tmdb", "trending", "day"),
  trendingMovies: apiQuery("tmdb", "trendingMovies", "week"),
  trendingTv: apiQuery("tmdb", "trendingTv", "week"),
};

export const Route = createFileRoute("/trending")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all(Object.values(q).map((query) => queryClient.ensureQueryData(query)));
  },
  head: () => ({
    meta: [
      { title: "Trending · Streamly" },
      { name: "description", content: "See what’s trending today and this week on Streamly." },
      { property: "og:title", content: "Trending · Streamly" },
    ],
    links: [{ rel: "canonical", href: "/trending" }],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const [{ data: trendingAll }, { data: trendingDay }, { data: trendingMovies }, { data: trendingTv }] =
    useSuspenseQueries({ queries: [q.trendingAll, q.trendingDay, q.trendingMovies, q.trendingTv] });

  const heroItems = trendingDay.results
    .filter((i) => i.backdrop_path && i.overview)
    .slice(0, 10);

  return (
    <div className="-mt-16">
      {heroItems.length > 0 && <Hero items={heroItems} />}
      <div className="mx-auto max-w-7xl">
        <Top10Row title="Top 10 Today" items={trendingDay.results} />
        <Row title="Trending This Week" items={trendingAll.results} />
        <Row
          title="Trending Movies"
          items={trendingMovies.results}
          forceType="movie"
        />
        <Row
          title="Trending TV Shows"
          items={trendingTv.results}
          forceType="tv"
        />
      </div>
    </div>
  );
}
