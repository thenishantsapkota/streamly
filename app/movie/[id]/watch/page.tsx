import { Link } from "@/lib/router-compat";
import { Player } from "@/components/Player";
import { Row } from "@/components/Row";
import type { CastEntry } from "@/components/CastOnPause";
import { backdropUrl, posterUrl, profileUrl, tmdbApi } from "@/lib/tmdb";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal, SplitTitle } from "@/components/motion";

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
      character: c.character || "",
    }));

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
        <header className="mb-6 sm:mb-8">
          <Link
            href={`/movie/${numId}`}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-brand"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" weight="bold" aria-hidden />
            Back to details
          </Link>
          <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-2">
            <SplitTitle
              text={movie.title ?? "Untitled"}
              className="min-w-0 max-w-4xl text-3xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl"
            />
            <Reveal y={8} delay={0.2} className="mb-1.5 flex items-center gap-4 tabular-nums text-xs uppercase text-text-dim">
              <span className="text-brand">Now playing</span>
              {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
            </Reveal>
          </div>
        </header>
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
        <Row title="More like this" items={recs.results} forceType="movie" />
      </div>
    </div>
  );
}
