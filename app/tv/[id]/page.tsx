import Image from "next/image";
import Link from "next/link";
import { Row } from "@/components/Row";
import { SeasonPicker } from "@/components/SeasonPicker";
import { WatchlistButton } from "@/components/WatchlistButton";
import { ShareButton } from "@/components/ShareButton";
import { TrailerMuteButton } from "@/components/TrailerMuteButton";
import { isAnimeTv, tmdbApi, IMG, posterUrl, backdropUrl, getYear } from "@/lib/tmdb";
import { BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";
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
        ) : tv.backdrop_path ? (
          <div className="absolute inset-0">
            <Image
              src={backdropUrl(tv.backdrop_path, "original")!}
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
              {tv.name ?? "Untitled"}
            </h1>
            {tv.tagline && (
              <p className="mt-2 italic text-sm sm:text-base text-white/70 drop-shadow">{tv.tagline}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-white/60">
              {[
                year,
                `${tv.number_of_seasons} season${tv.number_of_seasons === 1 ? "" : "s"}`,
                `${tv.number_of_episodes} ep`,
                tv.vote_average ? `★ ${tv.vote_average.toFixed(1)}` : "",
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
              {tv.overview}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/tv/${numId}/watch?s=${firstSeason}&e=1`}
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
                  type: "tv",
                  title: tv.name ?? "Untitled",
                  poster: posterUrl(tv.poster_path, "w342"),
                  year,
                  rating: tv.vote_average ?? 0,
                  addedAt: Date.now(),
                }}
              />
              <ShareButton title={tv.name ?? "Untitled"} text={tv.overview} />
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
            {tv.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tv.genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs"
                  >
                    {g.name}
                  </span>
                ))}
                <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-text-dim">
                  {tv.status}
                </span>
              </div>
            )}

            {/* Creator */}
            {creator && (
              <div className="text-sm mb-2">
                <span className="text-text-dim">Created by </span>
                <span className="font-medium">{creator.name}</span>
              </div>
            )}

            {/* Providers */}
            {streamOn.length > 0 && (
              <div className="mt-3">
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
        <SeasonPicker tvId={numId} seasons={tv.seasons} initialSeason={firstSeason} malId={malId} />
        <Row title="More Like This" items={recs.results} forceType="tv" />
      </div>
    </div>
  );
}
