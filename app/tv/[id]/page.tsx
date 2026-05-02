import Link from "next/link";
import { Row } from "@/components/Row";
import { SeasonPicker } from "@/components/SeasonPicker";
import { WatchlistButton } from "@/components/WatchlistButton";
import { isAnimeTv, tmdbApi, IMG, posterUrl, backdropUrl, getYear } from "@/lib/tmdb";
import { anilistApi } from "@/lib/anilist";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const t = await tmdbApi.tv(id);
    const desc = t.overview?.slice(0, 200) ?? `Watch ${t.name} online`;
    const poster = t.poster_path ? `https://image.tmdb.org/t/p/w780${t.poster_path}` : undefined;
    return {
      title: t.name,
      description: desc,
      alternates: { canonical: `/tv/${id}` },
      openGraph: {
        title: t.name ?? "TV Show",
        description: desc,
        type: "video.tv_show",
        url: `/tv/${id}`,
        images: poster ? [{ url: poster, width: 780, height: 1170 }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: t.name ?? "TV Show",
        description: desc,
        images: poster ? [poster] : undefined,
      },
    };
  } catch {
    return { title: "TV Show" };
  }
}

export default async function TvShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  const [tv, recs, credits, videos, providers] = await Promise.all([
    tmdbApi.tv(id),
    tmdbApi.tvRecs(id),
    tmdbApi.tvCredits(id).catch(() => ({ cast: [], crew: [] })),
    tmdbApi.tvVideos(id).catch(() => ({ results: [] })),
    tmdbApi.tvWatchProviders(id).catch(() => ({ results: {} as Record<string, never> })),
  ]);
  const firstSeason = tv.seasons.find((s) => s.season_number > 0)?.season_number ?? 1;

  let malId: number | null = null;
  if (isAnimeTv(tv)) {
    try {
      const matches = await anilistApi.search(tv.original_name || tv.name || "", 1);
      malId = matches[0]?.idMal ?? null;
    } catch {
      malId = null;
    }
  }

  const creator = credits.crew.find(
    (c) => c.job === "Executive Producer" || c.job === "Creator",
  );

  const trailer = videos.results.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
  );

  const usProviders = providers.results?.US;
  const streamOn = usProviders?.flatrate ?? [];

  const year = getYear(tv);

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
        ) : tv.backdrop_path ? (
          <div className="absolute inset-0 -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backdropUrl(tv.backdrop_path, "original")!}
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/80 to-transparent" />
          </div>
        ) : null}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 sm:pt-36 pb-10 sm:pb-16 flex gap-5 sm:gap-8">
          <div className="hidden sm:block w-44 shrink-0">
            {tv.poster_path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterUrl(tv.poster_path, "w500")!}
                alt={tv.name ?? ""}
                className="aspect-2/3 w-full rounded-lg object-cover ring-1 ring-border shadow-2xl"
              />
            )}
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-end">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight drop-shadow-lg">
              {tv.name ?? "Untitled"}
            </h1>
            {tv.tagline && (
              <p className="mt-1 italic text-sm sm:text-base text-text-dim">{tv.tagline}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-dim">
              {[
                year,
                `${tv.number_of_seasons} season${tv.number_of_seasons === 1 ? "" : "s"}`,
                `${tv.number_of_episodes} episodes`,
                tv.vote_average ? `★ ${tv.vote_average.toFixed(1)}` : "",
                tv.status,
              ]
                .filter(Boolean)
                .map((m, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-border">·</span>}
                    <span>{m}</span>
                  </span>
                ))}
            </div>
            {tv.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tv.genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-border bg-surface-2/60 backdrop-blur px-2.5 py-0.5 text-xs"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/90 line-clamp-3 sm:line-clamp-none">
              {tv.overview}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/tv/${numId}/watch?s=${firstSeason}&e=1`}
                className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-6 py-2.5 text-sm font-semibold text-white transition shadow-lg"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play S{firstSeason} · E1
              </Link>
              <WatchlistButton
                item={{
                  id: numId,
                  type: "tv",
                  title: tv.name ?? "Untitled",
                  poster: posterUrl(tv.poster_path, "w342"),
                  year,
                  rating: tv.vote_average ?? 0,
                  addedAt: Date.now(),
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {creator && (
          <div className="mt-4 text-sm">
            <span className="text-text-dim">Created by </span>
            <span className="font-medium">{creator.name}</span>
          </div>
        )}

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
        <SeasonPicker tvId={numId} seasons={tv.seasons} initialSeason={firstSeason} malId={malId} />
        <Row title="More Like This" items={recs.results} forceType="tv" />
      </div>
    </div>
  );
}
