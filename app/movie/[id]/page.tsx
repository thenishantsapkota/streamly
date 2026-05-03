import Image from "next/image";
import Link from "next/link";
import { Row } from "@/components/Row";
import { WatchlistButton } from "@/components/WatchlistButton";
import { ShareButton } from "@/components/ShareButton";
import type { CastEntry } from "@/components/CastOnPause";
import { TrailerMuteButton } from "@/components/TrailerMuteButton";
import { backdropUrl, posterUrl, profileUrl, tmdbApi, IMG, getYear } from "@/lib/tmdb";
import { BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";

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
      {/* Netflix-style billboard */}
      <section className="relative -mt-16 isolate overflow-hidden" style={{ height: "clamp(400px, 70vw * 9/16 + 4rem, 85vh)" }}>
        {/* Video / backdrop layer — full bleed */}
        {trailer ? (
          <div className="absolute inset-[-20%] pointer-events-none">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&fs=0&cc_load_policy=0&enablejsapi=1`}
              title=""
              allow="autoplay"
              className="h-full w-full border-0"
              tabIndex={-1}
              aria-hidden
            />
          </div>
        ) : movie.backdrop_path ? (
          <div className="absolute inset-0">
            <Image
              src={backdropUrl(movie.backdrop_path, "original")!}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL_LANDSCAPE}
            />
          </div>
        ) : null}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 via-35% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/20 via-50% to-transparent" />

        {/* Content overlay at bottom-left */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-10 sm:pb-14">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-lg max-w-2xl">
              {movie.title ?? "Untitled"}
            </h1>
            {movie.tagline && (
              <p className="mt-2 italic text-sm sm:text-base text-white/70 drop-shadow">{movie.tagline}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-white/60">
              {[
                year,
                fmtRuntime(movie.runtime),
                movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : "",
              ]
                .filter(Boolean)
                .map((m, i) => (
                  <span key={i}>
                    {i > 0 && <span className="mx-1">·</span>}
                    {m}
                  </span>
                ))}
            </div>
            <p className="mt-3 max-w-lg text-sm text-white/80 line-clamp-3 drop-shadow">
              {movie.overview}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/movie/${numId}/watch`}
                className="inline-flex items-center gap-2 rounded-md bg-white hover:bg-white/90 px-6 py-2.5 text-sm font-bold text-black transition shadow-lg"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
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
              <ShareButton title={movie.title ?? "Untitled"} text={movie.overview} />
            </div>
          </div>
        </div>

        {/* Mute button — bottom right */}
        {trailer && (
          <div className="absolute bottom-10 sm:bottom-14 right-4 sm:right-6 z-20">
            <TrailerMuteButton trailerKey={trailer.key} />
          </div>
        )}
      </section>

      {/* Detail section below billboard */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-8">
        <div>
          <div>
            {/* Genres */}
            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/genre/${g.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                    className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs hover:bg-surface hover:text-white transition"
                  >
                    {g.name}
                  </Link>
                ))}
                <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-text-dim">
                  {movie.status}
                </span>
              </div>
            )}

            {/* Crew */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
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

            {/* Providers */}
            {streamOn.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-text-dim">Stream on </span>
                <div className="mt-1.5 inline-flex gap-2">
                  {streamOn.map((p) => (
                    <Image
                      key={p.provider_id}
                      src={`${IMG}/w45${p.logo_path}`}
                      alt={p.provider_name}
                      title={p.provider_name}
                      width={36}
                      height={36}
                      className="size-9 rounded-lg ring-1 ring-border"
                      sizes="100vw"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl">
        <Row title="More Like This" items={recs.results} forceType="movie" />
      </div>
    </div>
  );
}
