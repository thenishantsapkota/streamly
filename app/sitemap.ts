import type { MetadataRoute } from "next";
import { tmdbApi } from "@/lib/tmdb";
import { anilistApi } from "@/lib/anilist";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400; // refresh daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/movies`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tv`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/anime`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  // Trending picks for fresh dynamic entries — keeps the sitemap small but
  // gives crawlers plenty of internal links to follow.
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

  return [...staticEntries, ...movieEntries, ...tvEntries, ...animeEntries];
}
