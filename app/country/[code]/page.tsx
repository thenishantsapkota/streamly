import { Link } from "@/lib/router-compat";
import { notFound } from "next/navigation";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/motion";
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
