import { HomeContent } from "@/components/HomeContent";
import { ProviderTabs } from "@/components/ProviderTabs";
import { tmdbApi } from "@/lib/tmdb";
import { anilistApi } from "@/lib/anilist";
import { HOME_PROVIDERS } from "@/lib/providers";

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, trendingToday, popularMovies, popularTv, topMovies, topTv, nowPlaying, trendingAnime, popularAnime, bollywoodMovies, bollywoodTv] =
    await Promise.all([
      tmdbApi.trending("week"),
      tmdbApi.trending("day"),
      tmdbApi.popularMovies(),
      tmdbApi.popularTv(),
      tmdbApi.topRatedMovies(),
      tmdbApi.topRatedTv(),
      tmdbApi.nowPlayingMovies(),
      anilistApi.trending(20).catch(() => []),
      anilistApi.popular(20).catch(() => []),
      tmdbApi.discoverByCountry("movie", "IN"),
      tmdbApi.discoverByCountry("tv", "IN"),
    ]);

  const providerEntries = await Promise.all(
    HOME_PROVIDERS.map(async (provider) => ({
      provider,
      items: (await tmdbApi.discoverByProvider("movie", provider.id, provider.region).catch(() => ({ results: [] }))).results,
    })),
  );
  const providerRows = <ProviderTabs entries={providerEntries} />;

  return (
    <HomeContent
      initial={{
        trending,
        trendingToday,
        popularMovies,
        popularTv,
        topMovies,
        topTv,
        nowPlaying,
        trendingAnime,
        popularAnime,
        bollywoodMovies,
        bollywoodTv,
      }}
      providerRows={providerRows}
    />
  );
}
