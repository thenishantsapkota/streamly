import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;
export const metadata = {
  title: "TV Shows",
  description: "Browse trending, popular, and top-rated TV shows on Streamly.",
  alternates: { canonical: "/tv" },
  openGraph: { title: "TV Shows · Streamly", url: "/tv" },
};

export default async function TvIndexPage() {
  const [popular, topRated, airing] = await Promise.all([
    tmdbApi.popularTv(),
    tmdbApi.topRatedTv(),
    tmdbApi.airingTodayTv(),
  ]);

  const heroItems = popular.results
    .filter((i) => i.backdrop_path && i.overview)
    .slice(0, 10)
    .map((i) => ({ ...i, media_type: "tv" as const }));

  return (
    <div className="-mt-16">
      {heroItems.length > 0 && <Hero items={heroItems} />}
      <div className="mx-auto max-w-7xl">
        <Row title="Airing Today" items={airing.results} forceType="tv" viewAllHref="/tv/airing-today" />
        <Row title="Popular" items={popular.results} forceType="tv" viewAllHref="/tv/popular" />
        <Row title="Top Rated" items={topRated.results} forceType="tv" viewAllHref="/tv/top-rated" />
      </div>
    </div>
  );
}
