import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import Image from "@/components/Image";
import { Link } from "@/lib/router-compat";
import { Row } from "@/components/Row";
import { WatchlistButton } from "@/components/WatchlistButton";
import { ShareButton } from "@/components/ShareButton";
import { TrailerMuteButton } from "@/components/TrailerMuteButton";
import { backdropUrl, posterUrl, IMG, getYear } from "@/lib/tmdb";
import { TrailerBackdrop } from "@/components/TrailerBackdrop";
import { ParallaxBackdrop, Reveal, SplitTitle } from "@/components/motion";
import { PlayIcon, StarIcon } from "@phosphor-icons/react";
import { apiQuery, apiQueryOr, notFoundIfMissing } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/site";

function fmtRuntime(min: number) {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

const queries = (id: string) =>
  [
    apiQuery("tmdb", "movie", id),
    apiQuery("tmdb", "movieRecs", id),
    apiQueryOr({ cast: [], crew: [] }, "tmdb", "movieCredits", id),
    apiQueryOr({ results: [] }, "tmdb", "movieVideos", id),
    apiQueryOr({ results: {} as Record<string, never> }, "tmdb", "movieWatchProviders", id),
  ] as const;

export const Route = createFileRoute("/movie/$id/")({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const q = queries(id);
    const [movie] = await Promise.all([
      queryClient.ensureQueryData(q[0]),
      queryClient.ensureQueryData(q[1]),
      queryClient.ensureQueryData(q[2]),
      queryClient.ensureQueryData(q[3]),
      queryClient.ensureQueryData(q[4]),
    ]).catch(notFoundIfMissing);
    return {
      title: movie.title ?? "Movie",
      description: movie.overview?.slice(0, 200) || `Watch ${movie.title} online`,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` : undefined,
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: `Movie · ${SITE_NAME}` }] };
    const { title, description, poster } = loaderData;
    const url = `${SITE_URL}/movie/${params.id}`;
    return {
      meta: [
        { title: `${title} · ${SITE_NAME}` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "video.movie" },
        { property: "og:url", content: url },
        ...(poster
          ? [
              { property: "og:image", content: poster },
              { property: "og:image:width", content: "780" },
              { property: "og:image:height", content: "1170" },
              { name: "twitter:image", content: poster },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: MoviePage,
});

function MoviePage() {
  const { id } = Route.useParams();
  const numId = Number(id);
  const [{ data: movie }, { data: recs }, { data: credits }, { data: videos }, { data: providers }] =
    useSuspenseQueries({ queries: queries(id) });

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

  const runtime = fmtRuntime(movie.runtime);

  return (
    <div className="pb-12">
      <section className="relative -mt-16 isolate min-h-[100dvh] overflow-hidden sm:min-h-[88dvh]">
        <ParallaxBackdrop className="absolute inset-0 -z-10">
          <TrailerBackdrop
            trailerKey={trailer?.key ?? null}
            backdrop={backdropUrl(movie.backdrop_path, "original")}
            title={movie.title ?? "Untitled"}
          />
        </ParallaxBackdrop>
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/50 via-40% to-bg/10" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-bg/90 via-bg/30 via-55% to-transparent" />

        <div className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-end px-4 pb-12 pt-28 sm:min-h-[88dvh] sm:px-6 sm:pb-16">
          <Reveal y={12} className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums text-xs uppercase text-white/70">
            {year && <span>{year}</span>}
            {runtime && <span>{runtime}</span>}
            {movie.vote_average ? (
              <span className="inline-flex items-center gap-1 text-brand">
                <StarIcon className="size-3" weight="fill" aria-hidden />
                {movie.vote_average.toFixed(1)}
              </span>
            ) : null}
          </Reveal>
          <SplitTitle
            text={movie.title ?? "Untitled"}
            delay={0.1}
            className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tighter sm:text-6xl lg:text-7xl"
          />
          {movie.tagline && (
            <Reveal delay={0.35} y={12}>
              <p className="mt-4 text-base text-white/70 sm:text-lg">{movie.tagline}</p>
            </Reveal>
          )}
          <Reveal delay={0.45} y={16}>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 line-clamp-3 sm:text-base">
              {movie.overview}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={`/movie/${numId}/watch`}
                className="group inline-flex items-center gap-2.5 bg-brand px-7 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
              >
                <PlayIcon className="size-4 transition-transform duration-300 group-hover:scale-110" weight="fill" aria-hidden />
                Watch now
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
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-white/80">{movie.overview}</p>
          {movie.genres.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {movie.genres.map((g) => (
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
            {director && (
              <>
                <dt className="text-text-dim">Director</dt>
                <dd className="font-medium">{director.name}</dd>
              </>
            )}
            {writers.length > 0 && (
              <>
                <dt className="text-text-dim">Writers</dt>
                <dd className="font-medium">{writers.map((w) => w.name).join(", ")}</dd>
              </>
            )}
            {runtime && (
              <>
                <dt className="text-text-dim">Runtime</dt>
                <dd className="tabular-nums">{runtime}</dd>
              </>
            )}
            {movie.status && (
              <>
                <dt className="text-text-dim">Status</dt>
                <dd>{movie.status}</dd>
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
        <Row title="More like this" items={recs.results} forceType="movie" />
      </div>
    </div>
  );
}
