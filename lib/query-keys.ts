/**
 * Centralized React Query key factory.
 * Keeps keys consistent between prefetch (server) and useQuery (client).
 */
export const qk = {
  // TMDB
  trending: (window: "day" | "week") => ["trending", window] as const,
  popularMovies: (page = 1) => ["popular-movies", page] as const,
  topRatedMovies: (page = 1) => ["top-rated-movies", page] as const,
  nowPlayingMovies: (page = 1) => ["now-playing-movies", page] as const,
  popularTv: (page = 1) => ["popular-tv", page] as const,
  topRatedTv: (page = 1) => ["top-rated-tv", page] as const,
  airingTodayTv: (page = 1) => ["airing-today-tv", page] as const,
  trendingMovies: (window: "day" | "week") => ["trending-movies", window] as const,
  trendingTv: (window: "day" | "week") => ["trending-tv", window] as const,

  // AniList
  trendingAnime: (perPage = 20) => ["trending-anime", perPage] as const,
  popularAnime: (perPage = 20) => ["popular-anime", perPage] as const,
  topRatedAnime: (perPage = 24) => ["top-rated-anime", perPage] as const,
};
