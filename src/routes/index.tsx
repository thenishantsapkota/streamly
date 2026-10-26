import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { Top10Row } from "@/components/Top10Row";
import { RecentlyWatched } from "@/components/RecentlyWatched";
import { PickForMe } from "@/components/PickForMe";
import { ProviderTabs } from "@/components/ProviderTabs";
import { CategoryBand } from "@/components/CategoryBand";
import { AnimeQueryRow, QueryRow, RowSkeleton } from "@/components/QueryRow";
import { HeroSkeleton, Top10Skeleton } from "@/components/PageSkeleton";
import { apiQuery } from "@/lib/api";
import { HOME_PROVIDERS } from "@/lib/providers";

const q = {
  trendingWeek: apiQuery("tmdb", "trending", "week"),
  trendingDay: apiQuery("tmdb", "trending", "day"),
  popularMovies: apiQuery("tmdb", "popularMovies"),
  popularTv: apiQuery("tmdb", "popularTv"),
};

/** Rows below the fold: fetched in parallel, streamed in as they resolve. */
const g = (title: string, id: number, slug: string) => ({
  title,
  query: apiQuery("tmdb", "discoverByGenre", "movie", id),
  href: `/genre/${slug}`,
});

const FILM_ROWS = [
  { title: "Trending films", query: apiQuery("tmdb", "trendingMovies", "week"), href: "/trending" },
  { title: "Now playing", query: apiQuery("tmdb", "nowPlayingMovies"), href: "/movies/now-playing" },
  { title: "Coming soon", query: apiQuery("tmdb", "upcomingMovies") },
  { title: "Popular films", query: q.popularMovies, href: "/movies/popular" },
  { title: "Top rated films", query: apiQuery("tmdb", "topRatedMovies"), href: "/movies/top-rated" },
  // Below the streaming switcher: fetched as the reader scrolls near them.
  g("Action", 28, "action"),
  g("Comedy", 35, "comedy"),
  g("Thriller", 53, "thriller"),
  { title: "Hidden gems", query: apiQuery("tmdb", "hiddenGemMovies") },
  g("Horror", 27, "horror"),
  g("Science fiction", 878, "sci-fi"),
  g("Romance", 10749, "romance"),
  g("Adventure", 12, "adventure"),
  { title: "2000s favourites", query: apiQuery("tmdb", "moviesByDecade", 2000) },
  g("Animation", 16, "animation"),
  g("Family night", 10751, "family"),
  g("Mystery", 9648, "mystery"),
  g("Fantasy", 14, "fantasy"),
  { title: "90s classics", query: apiQuery("tmdb", "moviesByDecade", 1990) },
  { title: "Bollywood", query: apiQuery("tmdb", "discoverByCountry", "movie", "IN"), href: "/country/IN" },
  { title: "Korean cinema", query: apiQuery("tmdb", "discoverByCountry", "movie", "KR"), href: "/country/KR" },
  { title: "Japanese cinema", query: apiQuery("tmdb", "discoverByCountry", "movie", "JP"), href: "/country/JP" },
  g("War", 10752, "war"),
  g("Documentaries", 99, "documentary"),
];

/** Rows rendered (and fetched) up front; everything after loads on approach. */
const EAGER_FILM_ROWS = 5;

const SERIES_ROWS = [
  { title: "Trending series", query: apiQuery("tmdb", "trendingTv", "week"), href: "/trending" },
  { title: "Airing today", query: apiQuery("tmdb", "airingTodayTv"), href: "/tv/airing-today" },
  { title: "On the air this week", query: apiQuery("tmdb", "onTheAirTv") },
  { title: "Popular series", query: q.popularTv, href: "/tv/popular" },
  { title: "Top rated series", query: apiQuery("tmdb", "topRatedTv"), href: "/tv/top-rated" },
  { title: "Crime", query: apiQuery("tmdb", "discoverByGenre", "tv", 80), href: "/genre/crime" },
  { title: "Korean dramas", query: apiQuery("tmdb", "discoverByCountry", "tv", "KR"), href: "/country/KR" },
  { title: "Indian series", query: apiQuery("tmdb", "discoverByCountry", "tv", "IN"), href: "/country/IN" },
] as const;

const ANIME_ROWS = [
  { title: "Trending anime", query: apiQuery("anilist", "trending", 20), href: "/anime/trending" },
  { title: "Popular anime", query: apiQuery("anilist", "popular", 20), href: "/anime/popular" },
  { title: "Top rated anime", query: apiQuery("anilist", "topRated", 20), href: "/anime/top-rated" },
] as const;

const providerQuery = (p: (typeof HOME_PROVIDERS)[number]) =>
  apiQuery("tmdb", "discoverByProvider", "movie", p.id, p.region);

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) => {
    // Start everything now; only wait for what renders above the fold.
    for (const row of FILM_ROWS.slice(0, EAGER_FILM_ROWS)) void queryClient.prefetchQuery(row.query);
    for (const p of HOME_PROVIDERS) void queryClient.prefetchQuery(providerQuery(p));
    // Don't await: the shell (with skeletons) streams immediately and each
    // section fills in as its query resolves.
    void queryClient.prefetchQuery(q.trendingWeek);
    void queryClient.prefetchQuery(q.trendingDay);
  },
  component: HomePage,
});

function HomePage() {
  return (
    <div className="-mt-16">
      <Suspense fallback={<HeroSkeleton />}>
        <HomeHero />
      </Suspense>
      <div className="mx-auto max-w-7xl">
        <RecentlyWatched />
        <Suspense fallback={<Top10Skeleton />}>
          <TodayTop10 />
        </Suspense>

        <CategoryBand word="Films" line="New releases, every genre, hidden gems and the classics worth revisiting." href="/movies" cta="All films" />
        {FILM_ROWS.slice(0, EAGER_FILM_ROWS).map((r) => (
          <QueryRow key={r.title} title={r.title} query={r.query} forceType="movie" href={"href" in r ? r.href : undefined} />
        ))}
        <Suspense fallback={<RowSkeleton />}>
          <Providers />
        </Suspense>
        {FILM_ROWS.slice(EAGER_FILM_ROWS).map((r) => (
          <QueryRow key={r.title} lazy title={r.title} query={r.query} forceType="movie" href={"href" in r ? r.href : undefined} />
        ))}

        <CategoryBand word="Series" line="What's airing now, what everyone's bingeing, and dramas from around the world." href="/tv" cta="All series" />
        {SERIES_ROWS.map((r) => (
          <QueryRow key={r.title} lazy title={r.title} query={r.query} forceType="tv" href={"href" in r ? r.href : undefined} />
        ))}

        <CategoryBand word="Anime" line="This season's simulcasts, fan favourites and all-time greats." href="/anime" cta="All anime" />
        {ANIME_ROWS.map((r) => (
          <AnimeQueryRow key={r.title} lazy title={r.title} query={r.query} href={r.href} />
        ))}
      </div>
      <Suspense fallback={null}>
        <Pick />
      </Suspense>
    </div>
  );
}

function HomeHero() {
  const { data } = useSuspenseQuery(q.trendingWeek);
  const items = data.results.filter((i) => i.backdrop_path && i.overview).slice(0, 10);
  return items.length > 0 ? <Hero items={items} /> : null;
}

function TodayTop10() {
  const { data } = useSuspenseQuery(q.trendingDay);
  return <Top10Row title="Top 10 today" items={data.results} />;
}

function Providers() {
  const results = useSuspenseQueries({
    queries: HOME_PROVIDERS.map(providerQuery),
  });
  return <ProviderTabs entries={HOME_PROVIDERS.map((provider, i) => ({ provider, items: results[i].data.results }))} />;
}

function Pick() {
  const [{ data: trending }, { data: movies }, { data: tv }] = useSuspenseQueries({
    queries: [q.trendingWeek, q.popularMovies, q.popularTv],
  });
  return (
    <PickForMe
      items={[
        ...trending.results,
        ...movies.results.map((m) => ({ ...m, media_type: "movie" as const })),
        ...tv.results.map((m) => ({ ...m, media_type: "tv" as const })),
      ]}
    />
  );
}
