"use client";

import { useRouter } from "next/navigation";

type Props = {
  animeId: number;
  currentEpisode: number;
  /** Best-known total episode count. null when unknown (ongoing series). */
  totalEpisodes: number | null;
};

export function AnimeEpisodeNav({ animeId, currentEpisode, totalEpisodes }: Props) {
  const router = useRouter();
  const hasPrev = currentEpisode > 1;
  const hasNext = totalEpisodes == null || currentEpisode < totalEpisodes;

  function go(ep: number) {
    router.push(`/anime/${animeId}/watch?e=${ep}`);
  }

  return (
    <div className="mt-3 flex items-center justify-between gap-2">
      <button
        type="button"
        disabled={!hasPrev}
        onClick={() => go(currentEpisode - 1)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-dim transition hover:text-white hover:border-text-dim disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-dim disabled:hover:border-border"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
          <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Prev · E{Math.max(1, currentEpisode - 1)}
      </button>
      <button
        type="button"
        disabled={!hasNext}
        onClick={() => go(currentEpisode + 1)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-dim transition hover:text-white hover:border-text-dim disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-text-dim disabled:hover:border-border"
      >
        Next · E{currentEpisode + 1}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
          <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
