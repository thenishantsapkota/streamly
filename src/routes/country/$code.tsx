import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react";
import { Link } from "@/lib/router-compat";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/motion";
import { Row } from "@/components/Row";
import { apiQuery } from "@/lib/api";
import { findCountry } from "@/lib/countries";

function countryQueries(code: string) {
  return [
    apiQuery("tmdb", "discoverByCountry", "movie", code),
    apiQuery("tmdb", "discoverByCountry", "movie", code, 2),
    apiQuery("tmdb", "discoverByCountry", "tv", code),
  ] as const;
}

export const Route = createFileRoute("/country/$code")({
  loader: async ({ params, context: { queryClient } }) => {
    const country = findCountry(params.code);
    if (!country) throw notFound();
    await Promise.all(countryQueries(country.code).map((query) => queryClient.ensureQueryData(query)));
    return { country };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.country.name} Movies & TV Shows · Streamly` },
            {
              name: "description",
              content: `Browse popular movies and TV shows from ${loaderData.country.name} on Streamly.`,
            },
            { property: "og:title", content: `${loaderData.country.name} · Streamly` },
          ],
          links: [{ rel: "canonical", href: `/country/${params.code}` }],
        }
      : {},
  component: CountryPage,
});

function CountryPage() {
  const { country } = Route.useLoaderData();
  const [{ data: movies }, { data: movies2 }, { data: tvShows }] = useSuspenseQueries({
    queries: countryQueries(country.code),
  });

  const hasContent =
    movies.results.length > 0 ||
    movies2.results.length > 0 ||
    tvShows.results.length > 0;

  const total = movies.results.length + movies2.results.length + tvShows.results.length;

  return (
    <div className="pt-10 pb-12 sm:pt-16">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title={country.name}
          subline={`Popular films and series made in ${country.name}.`}
          meta={
            <span className="inline-flex items-center gap-3">
              <span className="bg-surface-2 px-1.5 py-0.5 font-medium text-text ring-1 ring-inset ring-border">{country.code}</span>
              {total} titles
            </span>
          }
        />

        {!hasContent && (
          <Reveal className="mx-4 flex flex-col items-center border border-dashed border-border px-6 py-16 text-center sm:mx-6">
            <GlobeHemisphereWestIcon className="size-10 text-text-dim" weight="thin" aria-hidden />
            <p className="mt-4 max-w-sm text-sm text-text-dim">Nothing from {country.name} is listed right now.</p>
            <Link
              href="/country"
              className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-bg active:scale-[0.98]"
            >
              Pick another country
            </Link>
          </Reveal>
        )}

        {movies.results.length > 0 && (
          <Row
            title="Popular films"
            items={movies.results}
            forceType="movie"
          />
        )}
        {movies2.results.length > 0 && (
          <Row
            title="More films"
            items={movies2.results}
            forceType="movie"
          />
        )}
        {tvShows.results.length > 0 && (
          <Row
            title="Series"
            items={tvShows.results}
            forceType="tv"
          />
        )}
      </div>
    </div>
  );
}
