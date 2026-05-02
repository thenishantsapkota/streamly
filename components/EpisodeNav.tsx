"use client";

import { useRouter } from "next/navigation";
import type { Season } from "@/lib/tmdb";

type Target = { season: number; episode: number };

type Props = {
  tvId: number;
  seasons: Pick<Season, "season_number" | "episode_count">[];
  currentSeason: number;
  currentEpisode: number;
};

/**
 * Buttons for moving to the previous / next episode of a TV show, handling
 * season rollover (last episode of S1 → first episode of S2). Uses TMDB's
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

  return (
    <div className="mt-3 flex items-center justify-between gap-2">
      <button
        type="button"
        disabled={!prev}
        onClick={() => prev && go(prev)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-dim transition hover:text-white hover:border-text-dim disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-dim disabled:hover:border-border"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
          <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>
          {prev
            ? prev.season === currentSeason
              ? `Prev · E${prev.episode}`
              : `Prev · S${prev.season}·E${prev.episode}`
            : "Prev"}
        </span>
      </button>
      <button
        type="button"
        disabled={!next}
        onClick={() => next && go(next)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-dim transition hover:text-white hover:border-text-dim disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-dim disabled:hover:border-border"
      >
        <span>
          {next
            ? next.season === currentSeason
              ? `Next · E${next.episode}`
              : `Next · S${next.season}·E${next.episode}`
            : "Next"}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
          <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
