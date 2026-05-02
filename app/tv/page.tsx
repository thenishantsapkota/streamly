import { TvContent } from "./TvContent";
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

  return <TvContent initial={{ popular, topRated, airing }} />;
}
