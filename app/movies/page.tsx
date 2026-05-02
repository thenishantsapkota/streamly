import { MoviesContent } from "./MoviesContent";
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

  return <MoviesContent initial={{ popular, topRated, nowPlaying }} />;
}
