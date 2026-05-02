import { notFound } from "next/navigation";
import { Row } from "@/components/Row";
import { tmdbApi } from "@/lib/tmdb";
import { findCountry, COUNTRIES } from "@/lib/countries";

export const revalidate = 3600;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ code: c.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = findCountry(code);
  if (!country) return {};
  return {
    title: `${country.name} Movies & TV Shows`,
    description: `Browse popular movies and TV shows from ${country.name} on Streamly.`,
    alternates: { canonical: `/country/${code}` },
    openGraph: { title: `${country.name} · Streamly`, url: `/country/${code}` },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = findCountry(code);
  if (!country) notFound();

  const [movies, movies2, tvShows] = await Promise.all([
    tmdbApi.discoverByCountry("movie", country.code),
    tmdbApi.discoverByCountry("movie", country.code, 2),
    tmdbApi.discoverByCountry("tv", country.code),
  ]);

  const hasContent =
    movies.results.length > 0 ||
    movies2.results.length > 0 ||
    tvShows.results.length > 0;

  return (
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="px-4 sm:px-6 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {country.flag} {country.name}
          </h1>
          <p className="mt-1 text-text-dim">
            Popular movies and TV shows from {country.name}
          </p>
        </div>

        {!hasContent && (
          <div className="px-4 sm:px-6 py-12 text-center text-text-dim">
            No results found for {country.name}. Try another country.
          </div>
        )}

        {movies.results.length > 0 && (
          <Row
            title={`Popular ${country.name} Movies`}
            items={movies.results}
            forceType="movie"
          />
        )}
        {movies2.results.length > 0 && (
          <Row
            title={`More ${country.name} Movies`}
            items={movies2.results}
            forceType="movie"
          />
        )}
        {tvShows.results.length > 0 && (
          <Row
            title={`${country.name} TV Shows`}
            items={tvShows.results}
            forceType="tv"
          />
        )}
      </div>
    </div>
  );
}
