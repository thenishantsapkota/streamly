import { Hero } from "@/components/Hero";
import { Row } from "@/components/Row";
import { Top10Row } from "@/components/Top10Row";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;
export const metadata = {
  title: "Trending",
  description: "See what\u2019s trending today and this week on Streamly.",
  alternates: { canonical: "/trending" },
  openGraph: { title: "Trending · Streamly", url: "/trending" },
};

export default async function TrendingPage() {
  const [trendingAll, trendingDay, trendingMovies, trendingTv] =
    await Promise.all([
      tmdbApi.trending("week"),
      tmdbApi.trending("day"),
      tmdbApi.trendingMovies("week"),
      tmdbApi.trendingTv("week"),
    ]);

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
