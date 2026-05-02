const TMDB_BASE = "https://api.themoviedb.org/3";
export const IMG = "https://image.tmdb.org/t/p";

export type MediaType = "movie" | "tv";

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: MediaType;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends MediaItem {
  runtime: number;
  genres: Genre[];
  tagline: string;
  status: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string;
  runtime: number | null;
  vote_average: number;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
  overview: string;
}

export interface TvDetails extends MediaItem {
  number_of_seasons: number;
  number_of_episodes: number;
  genres: Genre[];
  tagline: string;
  status: string;
  seasons: Season[];
  original_language?: string;
  original_name?: string;
  origin_country?: string[];
}

/** Heuristic: TMDB shows that are Animation + Japanese-origin are anime. */
export function isAnimeTv(tv: Pick<TvDetails, "genres" | "original_language" | "origin_country">): boolean {
  const isAnimation = tv.genres?.some((g) => g.id === 16);
  const isJapanese =
    tv.original_language === "ja" || (tv.origin_country?.includes("JP") ?? false);
  return !!(isAnimation && isJapanese);
}

export interface SeasonDetails {
  id: number;
  name: string;
  season_number: number;
  episodes: Episode[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string | null;
  profile_path: string | null;
}

export function profileUrl(path: string | null, size: "w185" | "h632" | "original" = "w185") {
  if (!path) return null;
  return `${IMG}/${size}${path}`;
}

async function tmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not set. Add it to .env.local");
  }
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const tmdbApi = {
  trending: (window: "day" | "week" = "week") =>
    tmdb<{ results: MediaItem[] }>(`/trending/all/${window}`),

  popularMovies: (page = 1) => tmdb<{ results: MediaItem[] }>("/movie/popular", { page }),
  topRatedMovies: (page = 1) => tmdb<{ results: MediaItem[] }>("/movie/top_rated", { page }),
  nowPlayingMovies: (page = 1) => tmdb<{ results: MediaItem[] }>("/movie/now_playing", { page }),

  popularTv: (page = 1) => tmdb<{ results: MediaItem[] }>("/tv/popular", { page }),
  topRatedTv: (page = 1) => tmdb<{ results: MediaItem[] }>("/tv/top_rated", { page }),
  airingTodayTv: (page = 1) => tmdb<{ results: MediaItem[] }>("/tv/airing_today", { page }),

  search: (query: string, page = 1) =>
    tmdb<{ results: MediaItem[]; total_pages: number; page: number }>("/search/multi", {
      query,
      page,
      include_adult: "false",
    }),

  movie: (id: number | string) => tmdb<MovieDetails>(`/movie/${id}`),
  tv: (id: number | string) => tmdb<TvDetails>(`/tv/${id}`),
  season: (id: number | string, season: number | string) =>
    tmdb<SeasonDetails>(`/tv/${id}/season/${season}`),

  movieRecs: (id: number | string) =>
    tmdb<{ results: MediaItem[] }>(`/movie/${id}/recommendations`),
  tvRecs: (id: number | string) =>
    tmdb<{ results: MediaItem[] }>(`/tv/${id}/recommendations`),

  movieCredits: (id: number | string) =>
    tmdb<{ cast: CastMember[] }>(`/movie/${id}/credits`),
  tvCredits: (id: number | string) =>
    tmdb<{ cast: CastMember[] }>(`/tv/${id}/credits`),

  person: (id: number | string) => tmdb<PersonDetails>(`/person/${id}`),

  trendingMovies: (window: "day" | "week" = "week") =>
    tmdb<{ results: MediaItem[] }>(`/trending/movie/${window}`),

  trendingTv: (window: "day" | "week" = "week") =>
    tmdb<{ results: MediaItem[] }>(`/trending/tv/${window}`),

  discoverByGenre: (type: "movie" | "tv", genreId: number, page = 1) =>
    tmdb<{ results: MediaItem[] }>(`/discover/${type}`, {
      with_genres: genreId,
      sort_by: "popularity.desc",
      "vote_count.gte": 50,
      include_adult: "false",
      page,
    }),

  discoverByCountry: (type: "movie" | "tv", countryCode: string, page = 1) =>
    tmdb<{ results: MediaItem[] }>(`/discover/${type}`, {
      with_origin_country: countryCode,
      sort_by: "popularity.desc",
      "vote_count.gte": 10,
      include_adult: "false",
      page,
    }),

  /**
   * Discover popular movies/TV available on a given streaming provider in a
   * region. Used to power the platform "exclusives" rows.
   */
  discoverByProvider: (
    type: "movie" | "tv",
    providerId: number,
    region: string,
    page = 1,
  ) =>
    tmdb<{ results: MediaItem[] }>(`/discover/${type}`, {
      with_watch_providers: providerId,
      watch_region: region,
      sort_by: "popularity.desc",
      "vote_count.gte": 50,
      include_adult: "false",
      page,
    }),

  /**
   * Search TMDB for an anime title and return the best Japanese-language match.
   * Used to give vidking (which only supports TMDB IDs) a chance at playing anime.
   */
  findAnimeTmdbId: async (
    title: string,
    isMovie: boolean,
  ): Promise<number | null> => {
    const path = isMovie ? "/search/movie" : "/search/tv";
    const data = await tmdb<{
      results: Array<{ id: number; original_language: string; popularity: number }>;
    }>(path, { query: title, include_adult: "false" });
    const japanese = data.results.find((r) => r.original_language === "ja");
    return japanese?.id ?? data.results[0]?.id ?? null;
  },
};

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" = "w342") {
  if (!path) return null;
  return `${IMG}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: "w780" | "w1280" | "original" = "w1280") {
  if (!path) return null;
  return `${IMG}/${size}${path}`;
}

export function stillUrl(path: string | null, size: "w300" | "w780" = "w300") {
  if (!path) return null;
  return `${IMG}/${size}${path}`;
}

export function getTitle(item: MediaItem): string {
  return item.title || item.name || "Untitled";
}

export function getYear(item: MediaItem): string {
  const d = item.release_date || item.first_air_date;
  return d ? d.slice(0, 4) : "";
}
