import { MediaGrid } from "@/components/MediaGrid";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;
export const metadata = {
  title: "Now Playing Movies",
  description: "Movies currently playing in cinemas.",
  alternates: { canonical: "/movies/now-playing" },
};

export default async function NowPlayingPage() {
  const [p1, p2, p3] = await Promise.all([
    tmdbApi.nowPlayingMovies(),
    tmdbApi.nowPlayingMovies(2),
    tmdbApi.nowPlayingMovies(3),
  ]);
  const items = [...p1.results, ...p2.results, ...p3.results];

  return (
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="px-4 sm:px-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Now Playing</h1>
          <p className="mt-1 text-text-dim">Movies currently in cinemas</p>
        </div>
        <MediaGrid items={items} forceType="movie" />
      </div>
    </div>
  );
}
