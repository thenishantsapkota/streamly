"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PlayIcon, StarIcon } from "@phosphor-icons/react";
import { stillUrl, type Episode, type Season } from "@/lib/tmdb";
import { BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";
import { EASE_CINEMA } from "./motion";
import { RowHeader } from "./RowHeader";
import { DraggableScroll } from "./DraggableScroll";

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
  const [focus, setFocus] = useState<number | undefined>(undefined);
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

  const list = eps ?? [];
  const activeEp = season === initialSeason ? initialEpisode : undefined;
  const fallbackFocus = list.find((e) => e.episode_number === activeEp)?.episode_number ?? list[0]?.episode_number;
  const focusNum = focus ?? fallbackFocus;
  const focused = list.find((e) => e.episode_number === focusNum);
  const hrefFor = (n: number) => `/tv/${tvId}/watch?s=${season}&e=${n}`;
  const pick = (n: number) => onPick?.(season, n);
  const flagFor = (n: number) => fillerByAbs[malEpisodeOffset + n];

  return (
    <section className="mt-16">
      <RowHeader title="Episodes" />

      {/* Season selector: big numerals */}
      {validSeasons.length > 1 && (
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Season"
          className="no-scrollbar flex gap-6 overflow-x-auto px-4 pb-2 sm:gap-8 sm:px-6"
        >
          {validSeasons.map((s) => {
            const active = s.season_number === season;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setSeason(s.season_number);
                  setFocus(undefined);
                }}
                className="group shrink-0 text-left"
              >
                <span
                  className={`block font-display text-5xl font-extrabold leading-none tracking-tighter transition-colors duration-300 sm:text-6xl ${
                    active ? "text-brand" : "text-white/15 group-hover:text-white/45"
                  }`}
                >
                  {s.season_number}
                </span>
                <span
                  className={`mt-1 block whitespace-nowrap text-xs transition-colors ${
                    active ? "text-white" : "text-text-dim group-hover:text-white/80"
                  }`}
                >
                  {s.name}
                </span>
                <span className="mt-0.5 block text-xs tabular-nums text-text-dim">
                  {s.episode_count} episode{s.episode_count === 1 ? "" : "s"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Spotlight */}
      <div className="mt-8 px-4 sm:px-6">
        {loading || !focused ? (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="aspect-video shimmer lg:col-span-7" />
            <div className="space-y-3 lg:col-span-5">
              <div className="h-24 w-32 shimmer" />
              <div className="h-7 w-2/3 shimmer" />
              <div className="h-4 w-full shimmer" />
              <div className="h-4 w-5/6 shimmer" />
            </div>
          </div>
        ) : (
          <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="relative aspect-video overflow-hidden bg-surface-2 shadow-[0_40px_80px_-24px_rgb(0_0_0/0.9)] lg:col-span-7">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={`${season}-${focused.episode_number}`}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE_CINEMA }}
                >
                  {focused.still_path ? (
                    <Image
                      src={stillUrl(focused.still_path, "w780")!}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL_LANDSCAPE}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-dim">No still</div>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg/60 via-transparent to-transparent" />
              {focused.episode_number === activeEp && (
                <span className="absolute left-3 top-3 bg-brand px-2 py-1 text-[11px] font-semibold text-on-brand">
                  Now playing
                </span>
              )}
            </div>

            <div className="lg:col-span-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${season}-${focused.episode_number}`}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.4, ease: EASE_CINEMA }}
                >
                  <div className="flex items-end gap-4">
                    <span className="numeral-outline font-display text-7xl font-extrabold leading-[0.85] tracking-tighter sm:text-8xl">
                      {focused.episode_number}
                    </span>
                    <div className="pb-1 text-xs text-text-dim">
                      <div>Season {season}</div>
                      <div className="tabular-nums">of {list.length} episodes</div>
                    </div>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">{focused.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums text-text-dim">
                    {focused.runtime ? <span>{focused.runtime} min</span> : null}
                    {focused.air_date ? <span>{focused.air_date}</span> : null}
                    {focused.vote_average ? (
                      <span className="inline-flex items-center gap-1 text-brand">
                        <StarIcon className="size-3.5" weight="fill" aria-hidden />
                        {focused.vote_average.toFixed(1)}
                      </span>
                    ) : null}
                    {flagFor(focused.episode_number)?.filler && <span className="text-brand">Filler</span>}
                    {flagFor(focused.episode_number)?.recap && <span>Recap</span>}
                  </div>
                  <p className="mt-4 line-clamp-4 max-w-prose text-sm leading-relaxed text-white/75 sm:text-base">
                    {focused.overview || "No description yet."}
                  </p>
                  <div className="mt-6">
                    {asLinks ? (
                      <Link
                        href={hrefFor(focused.episode_number)}
                        className="group inline-flex items-center gap-2.5 bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
                      >
                        <PlayIcon className="size-4 transition-transform duration-300 group-hover:scale-110" weight="fill" aria-hidden />
                        Play episode {focused.episode_number}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => pick(focused.episode_number)}
                        className="group inline-flex items-center gap-2.5 bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
                      >
                        <PlayIcon className="size-4" weight="fill" aria-hidden />
                        Play episode {focused.episode_number}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Film strip */}
      <div className="mt-10 bg-surface py-3">
        <div aria-hidden className="mx-2 h-2.5 bg-[repeating-linear-gradient(90deg,var(--color-bg)_0_10px,transparent_10px_22px)]" />
        <DraggableScroll className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-video w-56 shrink-0 shimmer sm:w-64" />)}
          {!loading &&
            list.map((ep, i) => {
              const isFocus = ep.episode_number === focusNum;
              const isActive = ep.episode_number === activeEp;
              const still = stillUrl(ep.still_path, "w300");
              const flag = flagFor(ep.episode_number);
              const frame = (
                <div
                  className={`relative aspect-video w-56 overflow-hidden bg-surface-2 transition duration-500 ease-cinema sm:w-64 ${
                    isFocus ? "-translate-y-1 shadow-[0_0_0_2px_var(--color-brand)]" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {still && (
                    <Image
                      src={still}
                      alt=""
                      fill
                      sizes="256px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL_LANDSCAPE}
                      className={`object-cover transition duration-700 ease-cinema ${isFocus ? "scale-105" : "grayscale-[40%]"}`}
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end gap-2 p-2.5">
                    <span className={`font-display text-2xl font-bold leading-none ${isFocus ? "text-brand" : "text-white"}`}>
                      {ep.episode_number}
                    </span>
                    <span className="line-clamp-1 pb-0.5 text-xs text-white/85">{ep.name}</span>
                  </div>
                  {isActive && <span className="absolute right-2 top-2 size-2 bg-brand" aria-label="Now playing" />}
                  {flag?.filler && (
                    <span className="absolute left-2 top-2 bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-on-brand">F</span>
                  )}
                  {flag?.recap && !flag?.filler && (
                    <span className="absolute left-2 top-2 bg-bg/80 px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ring-white/25">R</span>
                  )}
                </div>
              );
              return (
                <motion.div
                  key={ep.id}
                  className="shrink-0"
                  initial={reduce ? false : { opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.04, ease: EASE_CINEMA }}
                  onMouseEnter={() => setFocus(ep.episode_number)}
                  onFocus={() => setFocus(ep.episode_number)}
                >
                  {asLinks ? (
                    <Link href={hrefFor(ep.episode_number)} aria-current={isActive ? "true" : undefined} aria-label={`Episode ${ep.episode_number}: ${ep.name}`} className="block">
                      {frame}
                    </Link>
                  ) : (
                    <button type="button" onClick={() => pick(ep.episode_number)} aria-label={`Episode ${ep.episode_number}: ${ep.name}`} className="block">
                      {frame}
                    </button>
                  )}
                </motion.div>
              );
            })}
          {!loading && eps && eps.length === 0 && (
            <p className="py-8 text-sm text-text-dim">No episodes for this season.</p>
          )}
        </DraggableScroll>
        <div aria-hidden className="mx-2 h-2.5 bg-[repeating-linear-gradient(90deg,var(--color-bg)_0_10px,transparent_10px_22px)]" />
      </div>
    </section>
  );
}
