import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Row } from "@/components/Row";
import { PageHeader } from "@/components/PageHeader";
import { apiQuery } from "@/lib/api";
import { findGenre, type GenreDef } from "@/lib/genres";

function genreQueries(genre: GenreDef) {
  return {
    movies1: genre.movieId ? apiQuery("tmdb", "discoverByGenre", "movie", genre.movieId) : null,
    movies2: genre.movieId ? apiQuery("tmdb", "discoverByGenre", "movie", genre.movieId, 2) : null,
    tv: genre.tvId ? apiQuery("tmdb", "discoverByGenre", "tv", genre.tvId) : null,
  };
}

export const Route = createFileRoute("/genre/$slug")({
  loader: async ({ params, context: { queryClient } }) => {
    const genre = findGenre(params.slug);
    if (!genre) throw notFound();
    const qs = genreQueries(genre);
    await Promise.all(
      [qs.movies1, qs.movies2, qs.tv].map((query) => query && queryClient.ensureQueryData(query)),
    );
    return { genre };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.genre.name} Movies & TV Shows · Streamly` },
            {
              name: "description",
              content: `Browse popular ${loaderData.genre.name} movies and TV shows on Streamly.`,
            },
            { property: "og:title", content: `${loaderData.genre.name} · Streamly` },
          ],
          links: [{ rel: "canonical", href: `/genre/${params.slug}` }],
        }
      : {},
  component: GenrePage,
});

function GenrePage() {
  const { genre } = Route.useLoaderData();
  const qs = genreQueries(genre);
  const active = [qs.movies1, qs.movies2, qs.tv].filter((query) => query !== null);
  const results = useSuspenseQueries({ queries: active });
  let idx = 0;

  const movies1 = qs.movies1 ? results[idx++]?.data.results ?? [] : [];
  const movies2 = qs.movies2 ? results[idx++]?.data.results ?? [] : [];
  const tvShows = qs.tv ? results[idx]?.data.results ?? [] : [];

  return (
    <div className="pt-10 pb-12 sm:pt-16">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title={genre.name}
          subline={`Popular ${genre.name.toLowerCase()} films${genre.tvId ? " and series" : ""}, picked by what people are watching.`}
          meta={`${movies1.length + movies2.length + tvShows.length} titles`}
        />

        {movies1.length > 0 && (
          <Row title="Popular films" items={movies1} forceType="movie" />
        )}
        {movies2.length > 0 && (
          <Row title="More films" items={movies2} forceType="movie" />
        )}
        {tvShows.length > 0 && (
          <Row title="Series" items={tvShows} forceType="tv" />
        )}
      </div>
    </div>
  );
}
