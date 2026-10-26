import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Reveal } from "@/components/motion";
import { apiQuery } from "@/lib/api";

const q = {
  popular: apiQuery("tmdb", "popularMovies"),
  topRated: apiQuery("tmdb", "topRatedMovies"),
  nowPlaying: apiQuery("tmdb", "nowPlayingMovies"),
};

export const Route = createFileRoute("/movies/")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(q.popular),
      queryClient.ensureQueryData(q.topRated),
      queryClient.ensureQueryData(q.nowPlaying),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Movies · Streamly" },
      { name: "description", content: "Browse trending, popular, and top-rated movies on Streamly." },
      { property: "og:title", content: "Movies · Streamly" },
    ],
    links: [{ rel: "canonical", href: "/movies" }],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  const [{ data: popular }, { data: topRated }, { data: nowPlaying }] = useSuspenseQueries({
    queries: [q.popular, q.topRated, q.nowPlaying],
  });

  const heroItems = popular.results
    .filter((i) => i.backdrop_path && i.overview)
    .slice(0, 10)
    .map((i) => ({ ...i, media_type: "movie" as const }));

  return (
    <div className="-mt-16">
      {heroItems.length > 0 && <Hero items={heroItems} label="Popular now" />}
      <div className="mx-auto max-w-7xl">
        <Reveal y={12} className="mt-10 px-4 sm:px-6">
          <CategoryTabs group="movies" />
        </Reveal>
        <Row title="Now Playing" items={nowPlaying.results} forceType="movie" viewAllHref="/movies/now-playing" />
        <Row title="Popular" items={popular.results} forceType="movie" viewAllHref="/movies/popular" />
        <Row title="Top Rated" items={topRated.results} forceType="movie" viewAllHref="/movies/top-rated" />
      </div>
    </div>
  );
}
