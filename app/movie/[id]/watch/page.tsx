import Link from "next/link";
import { Player } from "@/components/Player";
import { Row } from "@/components/Row";
import type { CastEntry } from "@/components/CastOnPause";
import { backdropUrl, posterUrl, profileUrl, tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const m = await tmdbApi.movie(id);
    return {
      title: `Watch ${m.title}`,
      description: m.overview?.slice(0, 200) ?? `Watch ${m.title} online`,
    };
  } catch {
    return { title: "Watch Movie" };
  }
}

export default async function MovieWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  const [movie, recs, credits] = await Promise.all([
    tmdbApi.movie(id),
    tmdbApi.movieRecs(id),
    tmdbApi.movieCredits(id).catch(() => ({ cast: [], crew: [] })),
  ]);

  const cast: CastEntry[] = credits.cast
    .slice(0, 20)
    .map((c) => ({
      personId: c.id,
      personName: c.name,
      personImage: profileUrl(c.profile_path, "w185"),
      character: c.character || "\u2014",
    }));

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <div className="mb-3">
          <Link
            href={`/movie/${numId}`}
            className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-white transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {movie.title}
          </Link>
        </div>
        <Player
          id={numId}
          type="movie"
          title={movie.title ?? "Untitled"}
          poster={posterUrl(movie.poster_path, "w342")}
          backdrop={backdropUrl(movie.backdrop_path, "w780")}
          cast={cast}
        />
      </div>
      <div className="mx-auto max-w-7xl">
        <Row title="More Like This" items={recs.results} forceType="movie" />
      </div>
    </div>
  );
}
