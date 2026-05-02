"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PAGE_SIZE = 50;
const FALLBACK_BLOCKS = 50;
const JIKAN_PAGE_SIZE = 100;

type FillerMap = Record<number, { filler: boolean; recap: boolean }>;

export function AnimeEpisodeList({
  animeId,
  malId,
  totalEpisodes,
  activeEpisode,
}: {
  animeId: number;
  /** MyAnimeList id used to fetch filler info from Jikan */
  malId?: number | null;
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

  // Fetch Jikan filler info for the visible range. Jikan pages hold 100
  // episodes each, so the visible range may span 1–2 jikan pages.
  const [fillerByEp, setFillerByEp] = useState<FillerMap>({});
  useEffect(() => {
    if (!malId) return;
    const firstJikanPage = Math.floor((start - 1) / JIKAN_PAGE_SIZE) + 1;
    const lastJikanPage = Math.floor((end - 1) / JIKAN_PAGE_SIZE) + 1;
    const pagesToFetch = [];
    for (let p = firstJikanPage; p <= lastJikanPage; p++) pagesToFetch.push(p);

    let cancelled = false;
    Promise.all(
      pagesToFetch.map((p) =>
        fetch(`/api/anime/episodes?mal=${malId}&page=${p}`)
          .then((r) => r.json())
          .then((j) => ({ p, data: j.data as Array<{ mal_id: number; filler: boolean; recap: boolean }> }))
          .catch(() => ({ p, data: [] as Array<{ mal_id: number; filler: boolean; recap: boolean }> })),
      ),
    ).then((results) => {
      if (cancelled) return;
      setFillerByEp((prev) => {
        const next = { ...prev };
        for (const { data } of results) {
          for (const e of data) {
            // Jikan's `mal_id` on this endpoint is the episode number.
            next[e.mal_id] = { filler: !!e.filler, recap: !!e.recap };
          }
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [malId, start, end]);

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
      {malId && (
        <p className="mt-2 text-xs text-text-dim">
          <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-300 px-1.5 py-0.5 font-mono text-[10px] mr-1.5">
            F
          </span>
          marks filler episodes (data from MyAnimeList).
        </p>
      )}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-10 gap-2">
        {eps.map((n) => {
          const active = n === activeEpisode;
          const meta = fillerByEp[n];
          return (
            <Link
              key={n}
              href={`/anime/${animeId}/watch?e=${n}`}
              className={`relative flex h-12 items-center justify-center rounded-md border text-sm font-medium transition ${
                active
                  ? "border-brand bg-brand/15 text-white"
                  : "border-border bg-surface text-text-dim hover:border-brand/60 hover:text-white"
              }`}
            >
              {n}
              {meta?.filler && (
                <span
                  title="Filler episode"
                  className="absolute top-1 right-1 inline-flex size-4 items-center justify-center rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-semibold"
                >
                  F
                </span>
              )}
              {meta?.recap && !meta?.filler && (
                <span
                  title="Recap"
                  className="absolute top-1 right-1 inline-flex size-4 items-center justify-center rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono font-semibold"
                >
                  R
                </span>
              )}
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
