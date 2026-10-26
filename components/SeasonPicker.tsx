"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PlayIcon, StarIcon } from "@phosphor-icons/react";
import { stillUrl, type Episode, type Season } from "@/lib/tmdb";
import { BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";
import { EASE_CINEMA, Reveal, StaggerItem } from "./motion";

type Props = {
  tvId: number;
  seasons: Season[];
  initialSeason: number;
  initialEpisode?: number;
  /** when set, render episode rows as <Link>s to /tv/{id}/watch?s=&e= */
  asLinks?: boolean;
  /** when set, used as the click handler instead of links */
  onPick?: (season: number, episode: number) => void;
  /**
   * MyAnimeList ID for filler-episode lookup. When provided (and TMDB seasons
   * map 1:1 to AniList absolute episodes), shows F/R badges on episodes.
   */
  malId?: number | null;
};

const JIKAN_PAGE_SIZE = 100;

type FillerMap = Record<number, { filler: boolean; recap: boolean }>;

export function SeasonPicker({
  tvId,
  seasons,
  initialSeason,
  initialEpisode,
  asLinks = true,
  onPick,
  malId,
}: Props) {
  const validSeasons = useMemo(
    () => seasons.filter((s) => s.season_number > 0 && s.episode_count > 0),
    [seasons],
  );
  const [season, setSeason] = useState(initialSeason);
  const [eps, setEps] = useState<Episode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const reduce = useReducedMotion();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Keep the initially selected season tab in view without scrolling the page.
  useEffect(() => {
    const strip = tabsRef.current;
    const tab = strip?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!strip || !tab) return;
    strip.scrollLeft = tab.offsetLeft - strip.clientWidth / 2 + tab.clientWidth / 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let aborted = false;
    setLoading(true);
    fetch(`/api/season?tv=${tvId}&season=${season}`)
      .then((r) => r.json())
      .then((d) => {
        if (!aborted) setEps(d.episodes ?? []);
      })
      .catch(() => {
        if (!aborted) setEps([]);
      })
      .finally(() => !aborted && setLoading(false));
    return () => {
      aborted = true;
    };
  }, [tvId, season]);

  // Compute the offset that converts (season, episode) to MAL absolute episode
  // by summing prior seasons' episode counts. Best-effort: assumes the AniList
  // entry covers the whole show. For long-running shows split into multiple
  // AniList entries, badges may not match.
  const malEpisodeOffset = useMemo(() => {
    if (!malId) return 0;
    let offset = 0;
    for (const s of validSeasons) {
      if (s.season_number >= season) break;
      offset += s.episode_count;
    }
    return offset;
  }, [malId, season, validSeasons]);

  // Fetch jikan filler info for the current season's range.
  const [fillerByAbs, setFillerByAbs] = useState<FillerMap>({});
  useEffect(() => {
    if (!malId || !eps || eps.length === 0) return;
    const firstAbs = malEpisodeOffset + 1;
    const lastAbs = malEpisodeOffset + eps.length;
    const firstPage = Math.floor((firstAbs - 1) / JIKAN_PAGE_SIZE) + 1;
    const lastPage = Math.floor((lastAbs - 1) / JIKAN_PAGE_SIZE) + 1;
    const pages: number[] = [];
    for (let p = firstPage; p <= lastPage; p++) pages.push(p);

    let cancelled = false;
    Promise.all(
      pages.map((p) =>
        fetch(`/api/anime/episodes?mal=${malId}&page=${p}`)
          .then((r) => r.json())
          .then((j) => (j.data ?? []) as Array<{ mal_id: number; filler: boolean; recap: boolean }>)
          .catch(() => [] as Array<{ mal_id: number; filler: boolean; recap: boolean }>),
      ),
    ).then((arrays) => {
      if (cancelled) return;
      setFillerByAbs((prev) => {
        const next = { ...prev };
        for (const arr of arrays) {
          for (const e of arr) next[e.mal_id] = { filler: !!e.filler, recap: !!e.recap };
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [malId, eps, malEpisodeOffset]);

  return (
    <section className="mt-14">
      <Reveal y={16} className="mb-4 flex items-end gap-4 px-4 sm:px-6">
        <h2 className="shrink-0 text-xl font-semibold tracking-tight sm:text-2xl">Episodes</h2>
        <span aria-hidden className="mb-2 h-px flex-1 bg-border" />
        {eps && !loading && (
          <span className="mb-0.5 shrink-0 tabular-nums text-sm text-text-dim">
            {eps.length} episode{eps.length === 1 ? "" : "s"}
          </span>
        )}
      </Reveal>

      {validSeasons.length > 1 && (
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Season"
          className="no-scrollbar relative flex gap-1 overflow-x-auto border-b border-border px-4 sm:px-6"
        >
          {validSeasons.map((s) => {
            const active = s.season_number === season;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSeason(s.season_number)}
                className={`relative shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors duration-300 ${
                  active ? "text-text" : "text-text-dim hover:text-text"
                }`}
              >
                {s.name}
                {active && (
                  <motion.span
                    layoutId={`season-tab-${tvId}`}
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
          key={`${season}-${loading ? "loading" : "ready"}`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_CINEMA }}
          className="mt-5 grid grid-cols-1 gap-x-5 gap-y-7 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3"
        >
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-video shimmer" />
                <div className="mt-3 h-4 w-2/3 shimmer" />
                <div className="mt-2 h-3 w-full shimmer" />
              </div>
            ))}
          {!loading &&
            eps?.map((ep, i) => {
              const active = season === initialSeason && initialEpisode === ep.episode_number;
              const absEp = malEpisodeOffset + ep.episode_number;
              const meta = fillerByAbs[absEp];
              const still = stillUrl(ep.still_path, "w300");
              const inner = (
                <div className="group">
                  <div
                    className={`relative aspect-video overflow-hidden bg-surface-2 transition-shadow duration-500 ${
                      active
                        ? "shadow-[0_0_0_2px_var(--color-brand)]"
                        : "shadow-[0_0_0_1px_var(--color-border)] group-hover:shadow-[0_0_0_1px_var(--color-brand)]"
                    }`}
                  >
                    {still ? (
                      <Image
                        src={still}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL_LANDSCAPE}
                        className="object-cover transition duration-700 ease-cinema group-hover:scale-105 group-hover:brightness-50"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-4xl font-semibold text-border">
                        {ep.episode_number}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-bg/80 via-transparent to-transparent" />
                    <span
                      className={`absolute bottom-2 left-3 font-display text-3xl font-semibold leading-none tabular-nums ${
                        active ? "text-brand" : "text-white"
                      }`}
                    >
                      {String(ep.episode_number).padStart(2, "0")}
                    </span>
                    {active ? (
                      <span className="absolute right-2 top-2 bg-brand px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-brand">
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
                      <span className="absolute left-2 top-2 bg-brand/90 px-1.5 py-0.5 tabular-nums text-[10px] font-semibold text-on-brand">
                        F
                      </span>
                    )}
                    {meta?.recap && !meta?.filler && (
                      <span className="absolute left-2 top-2 bg-bg/80 px-1.5 py-0.5 tabular-nums text-[10px] font-semibold text-text ring-1 ring-inset ring-white/25">
                        R
                      </span>
                    )}
                  </div>
                  <h3
                    className={`mt-3 line-clamp-1 text-sm font-semibold transition-colors ${
                      active ? "text-brand" : "group-hover:text-brand"
                    }`}
                  >
                    {ep.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 tabular-nums text-[11px] uppercase text-text-dim">
                    {ep.runtime ? <span>{ep.runtime}m</span> : null}
                    {ep.air_date ? <span>{ep.air_date}</span> : null}
                    {ep.vote_average ? (
                      <span className="inline-flex items-center gap-1 text-brand">
                        <StarIcon className="size-3" weight="fill" aria-hidden />
                        {ep.vote_average.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-dim">
                    {ep.overview || "No description."}
                  </p>
                </div>
              );
              return (
                <StaggerItem key={ep.id} index={i}>
                  {asLinks ? (
                    <Link
                      href={`/tv/${tvId}/watch?s=${season}&e=${ep.episode_number}`}
                      aria-current={active ? "true" : undefined}
                      className="block"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPick?.(season, ep.episode_number)}
                      className="block w-full text-left"
                    >
                      {inner}
                    </button>
                  )}
                </StaggerItem>
              );
            })}
          {!loading && eps && eps.length === 0 && (
            <p className="col-span-full text-sm text-text-dim">No episodes for this season.</p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
