import Link from "next/link";
import { DetailsHeader } from "@/components/DetailsHeader";
import { Row } from "@/components/Row";
import { WatchlistButton } from "@/components/WatchlistButton";
import type { CastEntry } from "@/components/CastOnPause";
import { backdropUrl, posterUrl, profileUrl, tmdbApi, IMG, getYear } from "@/lib/tmdb";

export const revalidate = 3600;

function fmtRuntime(min: number) {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const m = await tmdbApi.movie(id);
    const desc = m.overview?.slice(0, 200) ?? `Watch ${m.title} online`;
    const poster = m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : undefined;
    return {
      title: m.title,
      description: desc,
      alternates: { canonical: `/movie/${id}` },
      openGraph: {
        title: m.title,
        description: desc,
        type: "video.movie",
        url: `/movie/${id}`,
        images: poster ? [{ url: poster, width: 780, height: 1170 }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: m.title,
        description: desc,
        images: poster ? [poster] : undefined,
      },
    };
  } catch {
    return { title: "Movie" };
  }
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  const [movie, recs, credits, videos, providers] = await Promise.all([
    tmdbApi.movie(id),
    tmdbApi.movieRecs(id),
    tmdbApi.movieCredits(id).catch(() => ({ cast: [], crew: [] })),
    tmdbApi.movieVideos(id).catch(() => ({ results: [] })),
    tmdbApi.movieWatchProviders(id).catch(() => ({ results: {} as Record<string, never> })),
  ]);

  const cast: CastEntry[] = credits.cast
    .slice(0, 20)
    .map((c) => ({
      personId: c.id,
      personName: c.name,
      personImage: profileUrl(c.profile_path, "w185"),
      character: c.character || "\u2014",
    }));

  const director = credits.crew.find((c) => c.job === "Director");
  const writers = credits.crew
    .filter((c) => c.department === "Writing")
    .slice(0, 3);

  const trailer = videos.results.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
  );

  const usProviders = providers.results?.US;
  const streamOn = usProviders?.flatrate ?? [];

  const year = getYear(movie);

  return (
    <div className="pb-12">
      {/* Hero with trailer background */}
      <section className="relative -mt-16 overflow-hidden">
        {trailer ? (
          <div className="absolute inset-0 -z-10">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
              title=""
              allow="autoplay"
              className="absolute inset-0 h-full w-full scale-125 pointer-events-none"
              tabIndex={-1}
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/80 to-transparent" />
          </div>
        ) : movie.backdrop_path ? (
          <div className="absolute inset-0 -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backdropUrl(movie.backdrop_path, "original")!}
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/80 to-transparent" />
          </div>
        ) : null}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 sm:pt-36 pb-10 sm:pb-16 flex gap-5 sm:gap-8">
          <div className="hidden sm:block w-44 shrink-0">
            {movie.poster_path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterUrl(movie.poster_path, "w500")!}
                alt={movie.title ?? ""}
                className="aspect-2/3 w-full rounded-lg object-cover ring-1 ring-border shadow-2xl"
              />
            )}
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-end">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight drop-shadow-lg">
              {movie.title ?? "Untitled"}
            </h1>
            {movie.tagline && (
              <p className="mt-1 italic text-sm sm:text-base text-text-dim">{movie.tagline}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-dim">
              {[
                year,
                fmtRuntime(movie.runtime),
                movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : "",
                movie.status,
              ]
                .filter(Boolean)
                .map((m, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-border">·</span>}
                    <span>{m}</span>
                  </span>
                ))}
            </div>
            {movie.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/genre/${g.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                    className="rounded-full border border-border bg-surface-2/60 backdrop-blur px-2.5 py-0.5 text-xs hover:bg-surface-2 transition"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/90 line-clamp-3 sm:line-clamp-none">
              {movie.overview}
            </p>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/movie/${numId}/watch`}
                className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-6 py-2.5 text-sm font-semibold text-white transition shadow-lg"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch
              </Link>
              <WatchlistButton
                item={{
                  id: numId,
                  type: "movie",
                  title: movie.title ?? "Untitled",
                  poster: posterUrl(movie.poster_path, "w342"),
                  year,
                  rating: movie.vote_average ?? 0,
                  addedAt: Date.now(),
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Crew & providers */}
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {director && (
            <div>
              <span className="text-text-dim">Director </span>
              <span className="font-medium">{director.name}</span>
            </div>
          )}
          {writers.length > 0 && (
            <div>
              <span className="text-text-dim">Writers </span>
              <span className="font-medium">{writers.map((w) => w.name).join(", ")}</span>
            </div>
          )}
        </div>

        {streamOn.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-text-dim">Stream on </span>
            <div className="mt-1.5 inline-flex gap-2">
              {streamOn.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.provider_id}
                  src={`${IMG}/w45${p.logo_path}`}
                  alt={p.provider_name}
                  title={p.provider_name}
                  className="size-9 rounded-lg ring-1 ring-border"
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mx-auto max-w-7xl">
        <Row title="More Like This" items={recs.results} forceType="movie" />
      </div>
    </div>
  );
}
