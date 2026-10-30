import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { Player } from "@/components/Player";
import { SeasonPicker } from "@/components/SeasonPicker";
import { EpisodeNav } from "@/components/EpisodeNav";
import { backdropUrl, isAnimeTv, posterUrl } from "@/lib/tmdb";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Reveal, SplitTitle } from "@/components/motion";
import { apiQuery, apiQueryOr, notFoundIfMissing } from "@/lib/api";
import { SITE_NAME } from "@/lib/site";

/** `?s=2` -> 2; missing or junk -> 1. */
function toPositiveInt(v: unknown) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

const queries = (id: string) =>
  [apiQuery("tmdb", "tv", id)] as const;

export const Route = createFileRoute("/tv/$id/watch")({
  validateSearch: (search: Record<string, unknown>) => ({
    s: toPositiveInt(search.s),
    e: toPositiveInt(search.e),
  }),
  loaderDeps: ({ search: { s, e } }) => ({ s, e }),
  loader: async ({ context: { queryClient }, params: { id }, deps: { s, e } }) => {
    const q = queries(id);
    const tv = await queryClient.ensureQueryData(q[0]).catch(notFoundIfMissing);

    let malId: number | null = null;
    if (isAnimeTv(tv)) {
      const matches = await queryClient.ensureQueryData(
        apiQueryOr([], "anilist", "search", tv.original_name || tv.name || "", 1),
      );
      malId = matches[0]?.idMal ?? null;
    }

    return { malId, title: tv.name ?? "TV Show", season: s, episode: e };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} S${loaderData.season} E${loaderData.episode} · ${SITE_NAME}`
          : `Watch · ${SITE_NAME}`,
      },
    ],
  }),
  component: TvWatchPage,
});

function TvWatchPage() {
  const { id } = Route.useParams();
  const { s: season, e: episode } = Route.useSearch();
  const { malId } = Route.useLoaderData();
  const numId = Number(id);
  const [{ data: tv }] = useSuspenseQueries({ queries: queries(id) });


  return (
    <div className="pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
        <header className="mb-6 sm:mb-8">
          <Link
            href={`/tv/${numId}`}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-brand"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" weight="bold" aria-hidden />
            Back to series
          </Link>
          <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-2">
            <SplitTitle
              text={tv.name ?? "Untitled"}
              className="min-w-0 max-w-4xl text-3xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl"
            />
            <Reveal y={8} delay={0.2} className="mb-1.5 flex items-center gap-4 tabular-nums text-xs uppercase text-text-dim">
              <span className="text-brand">Season {season}</span>
              <span className="text-text">Episode {episode}</span>
            </Reveal>
          </div>
        </header>
        <Player
          id={numId}
          type="tv"
          title={tv.name ?? "Untitled"}
          poster={posterUrl(tv.poster_path, "w342")}
          backdrop={backdropUrl(tv.backdrop_path, "w780")}
          season={season}
          episode={episode}
        />
        <EpisodeNav
          tvId={numId}
          seasons={tv.seasons}
          currentSeason={season}
          currentEpisode={episode}
        />
      </div>
      <div className="mx-auto max-w-7xl">
        <SeasonPicker
          tvId={numId}
          seasons={tv.seasons}
          initialSeason={season}
          initialEpisode={episode}
          malId={malId}
        />
      </div>
    </div>
  );
}
