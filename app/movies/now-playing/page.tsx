import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
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
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Now Playing"
        subline="What is showing in cinemas this week."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="movies" />
      </PageHeader>
      <MediaGrid items={items} forceType="movie" />
    </div>
  );
}
