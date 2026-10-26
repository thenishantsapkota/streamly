
import { useRouter } from "@/lib/router-compat";
import type { Season } from "@/lib/tmdb";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

type Target = { season: number; episode: number };

type Props = {
  tvId: number;
  seasons: Pick<Season, "season_number" | "episode_count">[];
  currentSeason: number;
  currentEpisode: number;
};

/**
 * Buttons for moving to the previous / next episode of a TV show, handling
 * season rollover (last episode of S1 to first episode of S2). Uses TMDB's
 * `seasons[].episode_count` so we don't need a per-season fetch.
 */
export function EpisodeNav({ tvId, seasons, currentSeason, currentEpisode }: Props) {
  const router = useRouter();

  // Filter "Specials" (season_number === 0) and seasons with no episodes.
  const ordered = seasons
    .filter((s) => s.season_number > 0 && s.episode_count > 0)
    .sort((a, b) => a.season_number - b.season_number);

  function findPrev(): Target | null {
    if (currentEpisode > 1) return { season: currentSeason, episode: currentEpisode - 1 };
    const idx = ordered.findIndex((s) => s.season_number === currentSeason);
    if (idx <= 0) return null;
    const prevSeason = ordered[idx - 1];
    return { season: prevSeason.season_number, episode: prevSeason.episode_count };
  }

  function findNext(): Target | null {
    const here = ordered.find((s) => s.season_number === currentSeason);
    if (!here) return null;
    if (currentEpisode < here.episode_count) {
      return { season: currentSeason, episode: currentEpisode + 1 };
    }
    const idx = ordered.indexOf(here);
    if (idx === -1 || idx === ordered.length - 1) return null;
    const nextSeason = ordered[idx + 1];
    return { season: nextSeason.season_number, episode: 1 };
  }

  const prev = findPrev();
  const next = findNext();

  function go(t: Target) {
    router.push(`/tv/${tvId}/watch?s=${t.season}&e=${t.episode}`);
  }

  const label = (t: Target) => (t.season === currentSeason ? `E${t.episode}` : `S${t.season} E${t.episode}`);

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={!prev}
        onClick={() => prev && go(prev)}
        className="group flex min-w-0 items-center gap-3 border border-border bg-surface px-4 py-3 text-left transition duration-300 hover:border-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:active:scale-100"
      >
        <CaretLeftIcon className="size-4 shrink-0 text-text-dim transition duration-300 group-enabled:group-hover:-translate-x-0.5 group-enabled:group-hover:text-brand" weight="bold" aria-hidden />
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-wider text-text-dim">Previous</span>
          <span className="block truncate tabular-nums text-sm font-medium">{prev ? label(prev) : "None"}</span>
        </span>
      </button>
      <button
        type="button"
        disabled={!next}
        onClick={() => next && go(next)}
        className="group flex min-w-0 items-center gap-3 border border-border bg-surface px-4 py-3 text-left transition duration-300 hover:border-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:active:scale-100 justify-end text-right"
      >
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-wider text-text-dim">Next</span>
          <span className="block truncate tabular-nums text-sm font-medium transition-colors group-enabled:group-hover:text-brand">{next ? label(next) : "None"}</span>
        </span>
        <CaretRightIcon className="size-4 shrink-0 text-text-dim transition duration-300 group-enabled:group-hover:translate-x-0.5 group-enabled:group-hover:text-brand" weight="bold" aria-hidden />
      </button>
    </div>
  );
}
