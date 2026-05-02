import { notFound } from "next/navigation";
import { Row } from "@/components/Row";
import { tmdbApi } from "@/lib/tmdb";
import { findGenre, GENRES } from "@/lib/genres";

export const revalidate = 3600;

export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = findGenre(slug);
  if (!genre) return {};
  return {
    title: `${genre.name} Movies & TV Shows`,
    description: `Browse popular ${genre.name} movies and TV shows on Streamly.`,
    alternates: { canonical: `/genre/${slug}` },
    openGraph: { title: `${genre.name} · Streamly`, url: `/genre/${slug}` },
  };
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = findGenre(slug);
  if (!genre) notFound();

  const fetches: Promise<{ results: import("@/lib/tmdb").MediaItem[] }>[] = [];

  if (genre.movieId) {
    fetches.push(tmdbApi.discoverByGenre("movie", genre.movieId));
    fetches.push(tmdbApi.discoverByGenre("movie", genre.movieId, 2));
  }
  if (genre.tvId) {
    fetches.push(tmdbApi.discoverByGenre("tv", genre.tvId));
  }

  const results = await Promise.all(fetches);
  let idx = 0;

  const movies1 = genre.movieId ? results[idx++]?.results ?? [] : [];
  const movies2 = genre.movieId ? results[idx++]?.results ?? [] : [];
  const tvShows = genre.tvId ? results[idx]?.results ?? [] : [];

  return (
    <div className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="px-4 sm:px-6 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{genre.name}</h1>
          <p className="mt-1 text-text-dim">
            Browse popular {genre.name} movies{genre.tvId ? " and TV shows" : ""}
          </p>
        </div>

        {movies1.length > 0 && (
          <Row title={`Popular ${genre.name} Movies`} items={movies1} forceType="movie" />
        )}
        {movies2.length > 0 && (
          <Row title={`More ${genre.name} Movies`} items={movies2} forceType="movie" />
        )}
        {tvShows.length > 0 && (
          <Row title={`${genre.name} TV Shows`} items={tvShows} forceType="tv" />
        )}
      </div>
    </div>
  );
}
