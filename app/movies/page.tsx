import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;
export const metadata = {
  title: "Movies",
  description: "Browse trending, popular, and top-rated movies on Streamly.",
  alternates: { canonical: "/movies" },
  openGraph: { title: "Movies · Streamly", url: "/movies" },
};

export default async function MoviesPage() {
  const [popular, topRated, nowPlaying] = await Promise.all([
    tmdbApi.popularMovies(),
    tmdbApi.topRatedMovies(),
    tmdbApi.nowPlayingMovies(),
  ]);

  const heroItems = popular.results
    .filter((i) => i.backdrop_path && i.overview)
    .slice(0, 10)
    .map((i) => ({ ...i, media_type: "movie" as const }));

  return (
    <div className="-mt-16">
      {heroItems.length > 0 && <Hero items={heroItems} />}
      <div className="mx-auto max-w-7xl">
        <Row title="Now Playing" items={nowPlaying.results} forceType="movie" />
        <Row title="Popular" items={popular.results} forceType="movie" />
        <Row title="Top Rated" items={topRated.results} forceType="movie" />
      </div>
    </div>
  );
}
