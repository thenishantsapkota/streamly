"use client";

import Link from "next/link";
import { useState } from "react";

const PAGE_SIZE = 50;
const FALLBACK_BLOCKS = 50;

export function AnimeEpisodeList({
  animeId,
  totalEpisodes,
  activeEpisode,
}: {
  animeId: number;
  /** AniList may return null for ongoing/long-running shows. */
  totalEpisodes: number | null;
  activeEpisode?: number;
}) {
  const known = totalEpisodes != null && totalEpisodes > 0;
  const [extraPages, setExtraPages] = useState(0);
  const effectiveTotal = known ? (totalEpisodes as number) : (extraPages + 1) * FALLBACK_BLOCKS;

  const pages = Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE));
  const initialPage = activeEpisode ? Math.floor((activeEpisode - 1) / PAGE_SIZE) : 0;
  const [page, setPage] = useState(initialPage);

  const start = page * PAGE_SIZE + 1;
  const end = Math.min(effectiveTotal, (page + 1) * PAGE_SIZE);
  const eps = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <section className="mt-4 px-4 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Episodes
          {!known && (
            <span className="ml-2 text-xs font-normal text-text-dim">
              (count unknown — pick any episode)
            </span>
          )}
        </h2>
        {pages > 1 && (
          <select
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60"
          >
            {Array.from({ length: pages }, (_, p) => {
              const s = p * PAGE_SIZE + 1;
              const e = Math.min(effectiveTotal, (p + 1) * PAGE_SIZE);
              return (
                <option key={p} value={p}>
                  {s}–{e}
                </option>
              );
            })}
          </select>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-10 gap-2">
        {eps.map((n) => {
          const active = n === activeEpisode;
          return (
            <Link
              key={n}
              href={`/anime/${animeId}/watch?e=${n}`}
              className={`flex h-12 items-center justify-center rounded-md border text-sm font-medium transition ${
                active
                  ? "border-brand bg-brand/15 text-white"
                  : "border-border bg-surface text-text-dim hover:border-brand/60 hover:text-white"
              }`}
            >
              {n}
            </Link>
          );
        })}
      </div>
      {!known && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setExtraPages((x) => x + 1)}
            className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-text-dim hover:text-white"
          >
            Show {FALLBACK_BLOCKS} more
          </button>
        </div>
      )}
    </section>
  );
}
