"use client";

import { useRouter } from "next/navigation";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

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
    <div className="mt-4 grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={!hasPrev}
        onClick={() => go(currentEpisode - 1)}
        className="group flex min-w-0 items-center gap-3 border border-border bg-surface px-4 py-3 text-left transition duration-300 hover:border-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:active:scale-100"
      >
        <CaretLeftIcon className="size-4 shrink-0 text-text-dim transition duration-300 group-enabled:group-hover:-translate-x-0.5 group-enabled:group-hover:text-brand" weight="bold" aria-hidden />
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-wider text-text-dim">Previous</span>
          <span className="block truncate tabular-nums text-sm font-medium">{hasPrev ? `E${currentEpisode - 1}` : "None"}</span>
        </span>
      </button>
      <button
        type="button"
        disabled={!hasNext}
        onClick={() => go(currentEpisode + 1)}
        className="group flex min-w-0 items-center gap-3 border border-border bg-surface px-4 py-3 text-left transition duration-300 hover:border-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:active:scale-100 justify-end text-right"
      >
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-wider text-text-dim">Next</span>
          <span className="block truncate tabular-nums text-sm font-medium transition-colors group-enabled:group-hover:text-brand">{hasNext ? `E${currentEpisode + 1}` : "None"}</span>
        </span>
        <CaretRightIcon className="size-4 shrink-0 text-text-dim transition duration-300 group-enabled:group-hover:translate-x-0.5 group-enabled:group-hover:text-brand" weight="bold" aria-hidden />
      </button>
    </div>
  );
}
