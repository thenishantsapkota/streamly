/**
 * Client-side fetch helpers that call our API proxy routes.
 * These are used by React Query hooks for client-side data fetching.
 */

async function fetchTmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`/api/tmdb${path}`, window.location.origin);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB proxy ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function fetchAnilist<T>(type: string, perPage = 24): Promise<T> {
  const res = await fetch(`/api/anilist?type=${type}&perPage=${perPage}`);
  if (!res.ok) throw new Error(`AniList proxy ${res.status}`);
  return res.json() as Promise<T>;
}

// ---- TMDB client functions ----

import type { MediaItem } from "./tmdb";
import type { Anime } from "./anilist";

type PageResult = { results: MediaItem[] };

export const tmdbClient = {
  trending: (window: "day" | "week" = "week") =>
    fetchTmdb<PageResult>(`/trending/all/${window}`),

  popularMovies: (page = 1) =>
    fetchTmdb<PageResult>("/movie/popular", { page }),

  topRatedMovies: (page = 1) =>
    fetchTmdb<PageResult>("/movie/top_rated", { page }),

  nowPlayingMovies: (page = 1) =>
    fetchTmdb<PageResult>("/movie/now_playing", { page }),

  popularTv: (page = 1) =>
    fetchTmdb<PageResult>("/tv/popular", { page }),

  topRatedTv: (page = 1) =>
    fetchTmdb<PageResult>("/tv/top_rated", { page }),

  airingTodayTv: (page = 1) =>
    fetchTmdb<PageResult>("/tv/airing_today", { page }),

  trendingMovies: (window: "day" | "week" = "week") =>
    fetchTmdb<PageResult>(`/trending/movie/${window}`),

  trendingTv: (window: "day" | "week" = "week") =>
    fetchTmdb<PageResult>(`/trending/tv/${window}`),

  discoverByCountry: (type: "movie" | "tv", country: string, page = 1) =>
    fetchTmdb<PageResult>(`/discover/${type}`, {
      with_origin_country: country,
      sort_by: "popularity.desc",
      "vote_count.gte": 10,
      include_adult: "false",
      page,
    }),
};

// ---- AniList client functions ----

export const anilistClient = {
  trending: (perPage = 24) => fetchAnilist<Anime[]>("trending", perPage),
  popular: (perPage = 24) => fetchAnilist<Anime[]>("popular", perPage),
  topRated: (perPage = 24) => fetchAnilist<Anime[]>("top-rated", perPage),
};
