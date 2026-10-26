import { PageHeader } from "@/components/PageHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MediaGrid } from "@/components/MediaGrid";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;
export const metadata = {
  title: "Popular Movies",
  description: "Browse the most popular movies right now on Streamly.",
  alternates: { canonical: "/movies/popular" },
};

export default async function PopularMoviesPage() {
  const [p1, p2, p3] = await Promise.all([
    tmdbApi.popularMovies(),
    tmdbApi.popularMovies(2),
    tmdbApi.popularMovies(3),
  ]);
  const items = [...p1.results, ...p2.results, ...p3.results];

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-12 sm:pt-16">
      <PageHeader
        title="Popular Movies"
        subline="The films everyone is watching right now."
        meta={`${items.length} titles`}
      >
        <CategoryTabs group="movies" />
      </PageHeader>
      <MediaGrid items={items} forceType="movie" />
    </div>
  );
}
