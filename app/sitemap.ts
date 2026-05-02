import type { MetadataRoute } from "next";
import { tmdbApi } from "@/lib/tmdb";
import { anilistApi } from "@/lib/anilist";
import { SITE_URL } from "@/lib/site";
import { GENRES } from "@/lib/genres";
import { COUNTRIES } from "@/lib/countries";

export const revalidate = 86400; // refresh daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/movies`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tv`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/anime`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/trending`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/exclusives`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/country`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/my-list`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/movies/now-playing`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/movies/popular`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/movies/top-rated`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tv/popular`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/tv/top-rated`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tv/airing-today`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/anime/trending`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/anime/popular`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/anime/top-rated`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const genreEntries: MetadataRoute.Sitemap = GENRES.map((g) => ({
    url: `${SITE_URL}/genre/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const countryEntries: MetadataRoute.Sitemap = COUNTRIES.map((c) => ({
    url: `${SITE_URL}/country/${c.code}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const [trending, popularTv, trendingAnime] = await Promise.all([
    tmdbApi.popularMovies().catch(() => ({ results: [] })),
    tmdbApi.popularTv().catch(() => ({ results: [] })),
    anilistApi.popular(40).catch(() => []),
  ]);

  const movieEntries: MetadataRoute.Sitemap = trending.results.slice(0, 40).map((m) => ({
    url: `${SITE_URL}/movie/${m.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const tvEntries: MetadataRoute.Sitemap = popularTv.results.slice(0, 40).map((t) => ({
    url: `${SITE_URL}/tv/${t.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const animeEntries: MetadataRoute.Sitemap = trendingAnime.slice(0, 40).map((a) => ({
    url: `${SITE_URL}/anime/${a.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...genreEntries,
    ...countryEntries,
    ...movieEntries,
    ...tvEntries,
    ...animeEntries,
  ];
}
