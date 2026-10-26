
import { Link } from "@/lib/router-compat";
import { useEffect, useState } from "react";
import type { StreamingEpisode } from "@/lib/anilist";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PlayIcon, PlusIcon } from "@phosphor-icons/react";
import { EASE_CINEMA, Reveal, StaggerItem } from "./motion";

const PAGE_SIZE = 50;
const FALLBACK_BLOCKS = 50;
const JIKAN_PAGE_SIZE = 100;

type FillerMap = Record<number, { filler: boolean; recap: boolean }>;

export function AnimeEpisodeList({
  animeId,
  malId,
  totalEpisodes,
  activeEpisode,
  streamingEpisodes,
}: {
  animeId: number;
  /** MyAnimeList id used to fetch filler info from Jikan */
  malId?: number | null;
  /** AniList may return null for ongoing/long-running shows. */
  totalEpisodes: number | null;
  activeEpisode?: number;
  /** Episode metadata from AniList (titles + thumbnails) */
  streamingEpisodes?: StreamingEpisode[] | null;
}) {
  const known = totalEpisodes != null && totalEpisodes > 0;
  const reduce = useReducedMotion();
  const [extraPages, setExtraPages] = useState(0);
  const effectiveTotal = known ? (totalEpisodes as number) : (extraPages + 1) * FALLBACK_BLOCKS;

  const pages = Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE));
  const initialPage = activeEpisode ? Math.floor((activeEpisode - 1) / PAGE_SIZE) : 0;
  const [page, setPage] = useState(initialPage);

  const start = page * PAGE_SIZE + 1;
  const end = Math.min(effectiveTotal, (page + 1) * PAGE_SIZE);
  const eps = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // Build a map of episode number -> streaming episode info
  const epInfoMap = new Map<number, StreamingEpisode>();
  if (streamingEpisodes) {
    for (let i = 0; i < streamingEpisodes.length; i++) {
      epInfoMap.set(i + 1, streamingEpisodes[i]);
    }
  }

  const hasEpInfo = epInfoMap.size > 0;

  // Fetch Jikan filler info for the visible range
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

  // Extract episode title from AniList streaming episode title
  // Titles come in format like "Episode 1 - Title" or just the title
  function getEpTitle(ep: StreamingEpisode | undefined, epNum: number): string | null {
    if (!ep?.title) return null;
    // Try to extract just the title portion after "Episode X - "
    const match = ep.title.match(/(?:Episode\s+\d+\s*[-\u2013:]\s*)(.*)/i);
    if (match?.[1]) return match[1];
    // If it's already just the title (no "Episode X" prefix)
    if (!ep.title.toLowerCase().startsWith("episode")) return ep.title;
    return null;
  }

  return (
    <section className="mt-14">
      <Reveal y={16} className="mb-4 flex items-end gap-4 px-4 sm:px-6">
        <h2 className="shrink-0 text-xl font-semibold tracking-tight sm:text-2xl">Episodes</h2>
        <span aria-hidden className="mb-2 h-px flex-1 bg-border" />
        <span className="mb-0.5 shrink-0 tabular-nums text-sm text-text-dim">
          {known ? `${totalEpisodes} episode${totalEpisodes === 1 ? "" : "s"}` : "Count unknown"}
        </span>
      </Reveal>

      {pages > 1 && (
        <div
          role="tablist"
          aria-label="Episode range"
          className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border px-4 sm:px-6"
        >
          {Array.from({ length: pages }, (_, p) => {
            const s = p * PAGE_SIZE + 1;
            const e = Math.min(effectiveTotal, (p + 1) * PAGE_SIZE);
            const active = p === page;
            return (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPage(p)}
                className={`relative shrink-0 whitespace-nowrap px-3 py-2.5 tabular-nums text-sm font-medium transition-colors duration-300 ${
                  active ? "text-text" : "text-text-dim hover:text-text"
                }`}
              >
                {s}-{e}
                {active && (
                  <motion.span
                    layoutId={`anime-range-${animeId}`}
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-brand"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {malId && (
        <p className="mt-4 flex items-center gap-2 px-4 text-xs text-text-dim sm:px-6">
          <span className="inline-flex size-4 items-center justify-center bg-brand/15 tabular-nums text-[10px] font-semibold text-brand">
            F
          </span>
          marks filler episodes (data from MyAnimeList).
        </p>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={page}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_CINEMA }}
          className="px-4 sm:px-6"
        >
          {hasEpInfo ? (
            /* Rich episode list with thumbnails */
            <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {eps.map((n, i) => {
                const active = n === activeEpisode;
                const meta = fillerByEp[n];
                const epInfo = epInfoMap.get(n);
                const title = getEpTitle(epInfo, n);
                const thumb = epInfo?.thumbnail;

                return (
                  <StaggerItem key={n} index={i}>
                    <Link
                      href={`/anime/${animeId}/watch?e=${n}`}
                      aria-current={active ? "true" : undefined}
                      className="group block"
                    >
                      <div
                        className={`relative aspect-video overflow-hidden bg-surface-2 transition-shadow duration-500 ${
                          active
                            ? "shadow-[0_0_0_2px_var(--color-brand)]"
                            : "shadow-[0_0_0_1px_var(--color-border)] group-hover:shadow-[0_0_0_1px_var(--color-brand)]"
                        }`}
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={`Episode ${n}`}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-700 ease-cinema group-hover:scale-105 group-hover:brightness-50"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-display text-4xl font-semibold text-border">
                            {n}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-bg/80 via-transparent to-transparent" />
                        <span
                          className={`absolute bottom-2 left-3 font-display text-3xl font-semibold leading-none tabular-nums ${
                            active ? "text-brand" : "text-white"
                          }`}
                        >
                          {String(n).padStart(2, "0")}
                        </span>
                        {active ? (
                          <span className="rounded-btn absolute right-2 top-2 bg-brand px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-brand">
                            Now playing
                          </span>
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-500 ease-cinema group-hover:opacity-100">
                            <span className="inline-flex size-11 scale-75 items-center justify-center bg-brand text-on-brand transition-transform duration-500 ease-cinema group-hover:scale-100">
                              <PlayIcon className="size-4" weight="fill" aria-hidden />
                            </span>
                          </span>
                        )}
                        {meta?.filler && (
                          <span className="absolute left-2 top-2 bg-brand/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-on-brand">
                            Filler
                          </span>
                        )}
                        {meta?.recap && !meta?.filler && (
                          <span className="rounded-btn absolute left-2 top-2 bg-bg/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text ring-1 ring-inset ring-white/25">
                            Recap
                          </span>
                        )}
                      </div>
                      <h3
                        className={`mt-3 line-clamp-1 text-sm font-semibold transition-colors ${
                          active ? "text-brand" : "group-hover:text-brand"
                        }`}
                      >
                        Episode {n}
                      </h3>
                      {title && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-dim">{title}</p>}
                    </Link>
                  </StaggerItem>
                );
              })}
            </div>
          ) : (
            /* Compact numbered grid when no episode info available */
            <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-10">
              {eps.map((n, i) => {
                const active = n === activeEpisode;
                const meta = fillerByEp[n];
                return (
                  <StaggerItem key={n} index={i}>
                    <Link
                      href={`/anime/${animeId}/watch?e=${n}`}
                      aria-current={active ? "true" : undefined}
                      className={`group relative flex h-12 items-center justify-center tabular-nums text-sm font-medium transition duration-300 active:scale-[0.98] ${
                        active
                          ? "bg-brand text-on-brand"
                          : "bg-surface text-text-dim ring-1 ring-inset ring-border hover:text-brand hover:ring-brand"
                      }`}
                    >
                      {n}
                      {meta?.filler && (
                        <span
                          title="Filler episode"
                          className={`absolute right-1 top-1 inline-flex size-3.5 items-center justify-center text-[9px] font-semibold ${
                            active ? "bg-on-brand text-brand" : "bg-brand/20 text-brand"
                          }`}
                        >
                          F
                        </span>
                      )}
                      {meta?.recap && !meta?.filler && (
                        <span
                          title="Recap"
                          className="absolute right-1 top-1 inline-flex size-3.5 items-center justify-center text-[9px] font-semibold ring-1 ring-inset ring-white/25"
                        >
                          R
                        </span>
                      )}
                    </Link>
                  </StaggerItem>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {!known && (
        <div className="mt-6 flex justify-center px-4">
          <button
            type="button"
            onClick={() => setExtraPages((x) => x + 1)}
            className="rounded-btn group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text ring-1 ring-inset ring-white/25 transition duration-300 hover:bg-white hover:text-bg active:scale-[0.98]"
          >
            <PlusIcon className="size-4 transition-transform duration-300 group-hover:rotate-90" weight="bold" aria-hidden />
            Show {FALLBACK_BLOCKS} more
          </button>
        </div>
      )}
    </section>
  );
}
