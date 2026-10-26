import Image from "@/components/Image";
import { Link } from "@/lib/router-compat";
import { Row } from "@/components/Row";
import { SeasonPicker } from "@/components/SeasonPicker";
import { WatchlistButton } from "@/components/WatchlistButton";
import { ShareButton } from "@/components/ShareButton";
import { TrailerMuteButton } from "@/components/TrailerMuteButton";
import { isAnimeTv, tmdbApi, IMG, posterUrl, backdropUrl, getYear } from "@/lib/tmdb";
import { TrailerBackdrop } from "@/components/TrailerBackdrop";
import { ParallaxBackdrop, Reveal, SplitTitle } from "@/components/motion";
import { anilistApi } from "@/lib/anilist";
import { PlayIcon, StarIcon } from "@phosphor-icons/react/dist/ssr";

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
  const seasonCount = tv.number_of_seasons;
  const epCount = tv.number_of_episodes;

  return (
    <div className="pb-12">
      <section className="relative -mt-16 isolate min-h-[100dvh] overflow-hidden sm:min-h-[88dvh]">
        <ParallaxBackdrop className="absolute inset-0 -z-10">
          <TrailerBackdrop
            trailerKey={trailer?.key ?? null}
            backdrop={backdropUrl(tv.backdrop_path, "original")}
            title={tv.name ?? "Untitled"}
          />
        </ParallaxBackdrop>
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/50 via-40% to-bg/10" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-bg/90 via-bg/30 via-55% to-transparent" />

        <div className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-end px-4 pb-12 pt-28 sm:min-h-[88dvh] sm:px-6 sm:pb-16">
          <Reveal y={12} className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums text-xs uppercase text-white/70">
            {year && <span>{year}</span>}
            {seasonCount > 0 && (
              <span>
                {seasonCount} season{seasonCount === 1 ? "" : "s"}
              </span>
            )}
            {epCount > 0 && <span>{epCount} episodes</span>}
            {tv.vote_average ? (
              <span className="inline-flex items-center gap-1 text-brand">
                <StarIcon className="size-3" weight="fill" aria-hidden />
                {tv.vote_average.toFixed(1)}
              </span>
            ) : null}
          </Reveal>
          <SplitTitle
            text={tv.name ?? "Untitled"}
            delay={0.1}
            className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tighter sm:text-6xl lg:text-7xl"
          />
          {tv.tagline && (
            <Reveal delay={0.35} y={12}>
              <p className="mt-4 text-base text-white/70 sm:text-lg">{tv.tagline}</p>
            </Reveal>
          )}
          <Reveal delay={0.45} y={16}>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 line-clamp-3 sm:text-base">
              {tv.overview}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={`/tv/${numId}/watch?s=${firstSeason}&e=1`}
                className="group inline-flex items-center gap-2.5 bg-brand px-7 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
              >
                <PlayIcon className="size-4 transition-transform duration-300 group-hover:scale-110" weight="fill" aria-hidden />
                Play S{firstSeason} E1
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
              {trailer && (
                <div className="ml-auto">
                  <TrailerMuteButton trailerKey={trailer.key} />
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto mt-6 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Reveal>
          <h2 className="text-xl font-semibold tracking-tight">Synopsis</h2>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-white/80">{tv.overview}</p>
          {tv.genres.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tv.genres.map((g) => (
                <Link
                  key={g.id}
                  href={`/genre/${g.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                  className="border border-border px-3 py-1.5 text-xs text-text-dim transition hover:border-brand hover:text-brand"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-border pt-5 text-sm">
            {creator && (
              <>
                <dt className="text-text-dim">Created by</dt>
                <dd className="font-medium">{creator.name}</dd>
              </>
            )}
            {seasonCount > 0 && (
              <>
                <dt className="text-text-dim">Seasons</dt>
                <dd className="tabular-nums">{seasonCount}</dd>
              </>
            )}
            {epCount > 0 && (
              <>
                <dt className="text-text-dim">Episodes</dt>
                <dd className="tabular-nums">{epCount}</dd>
              </>
            )}
            {tv.status && (
              <>
                <dt className="text-text-dim">Status</dt>
                <dd>{tv.status}</dd>
              </>
            )}
            {streamOn.length > 0 && (
              <>
                <dt className="self-center text-text-dim">Stream on</dt>
                <dd className="flex flex-wrap gap-2">
                  {streamOn.map((p) => (
                    <Image
                      key={p.provider_id}
                      src={`${IMG}/w45${p.logo_path}`}
                      alt={p.provider_name}
                      title={p.provider_name}
                      width={32}
                      height={32}
                      className="size-8 ring-1 ring-border"
                      sizes="32px"
                    />
                  ))}
                </dd>
              </>
            )}
          </dl>
        </Reveal>
      </div>

      <div className="mx-auto max-w-7xl">
        <SeasonPicker tvId={numId} seasons={tv.seasons} initialSeason={firstSeason} malId={malId} />
        <Row title="More like this" items={recs.results} forceType="tv" />
      </div>
    </div>
  );
}
