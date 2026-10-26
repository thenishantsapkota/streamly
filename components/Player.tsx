
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/lib/router-compat";
import { getWatched, upsertWatched, type WatchedItem } from "@/lib/storage";
import { CastOnPause, type CastEntry } from "./CastOnPause";
import { AdBlockerHint } from "./AdBlockerHint";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowsClockwiseIcon, InfoIcon, XIcon } from "@phosphor-icons/react";
import { EASE_CINEMA } from "./motion";

export type PlayerMediaType = "movie" | "tv" | "anime";

type Props = {
  id: number;
  type: PlayerMediaType;
  title: string;
  poster: string | null;
  backdrop: string | null;
  /** TV: season number. Anime: ignored. */
  season?: number;
  /** TV/Anime: episode number. */
  episode?: number;
  /** Hex color without # */
  color?: string;
  /** Cast/character info shown when video is paused */
  cast?: CastEntry[];
  /**
   * For anime: optional TMDB fallback so vidsrc (which only knows TMDB IDs)
   * can be used as an alternate source. When present, the source switcher
   * is enabled for anime.
   */
  tmdbAlt?: { id: number; type: "movie" | "tv" } | null;
};

type Source = "videasy" | "vidsrc";

const SOURCE_PREF_KEY = "preferred-source-v1";
const ANIME_SOURCE_PREF_KEY = "preferred-source-anime-v1";
const FALLBACK_HINT_AFTER_MS = 12000;
const AUTO_FALLBACK_AFTER_MS = 18000;

type NormalizedEvent = {
  event?: string;
  currentTime: number;
  duration: number;
  progress: number;
  id: string | number;
  mediaType: string;
  season?: number;
  episode?: number;
};

function normalizeMessage(raw: unknown): NormalizedEvent | null {
  let payload: any = raw;
  if (typeof raw === "string") {
    try {
      payload = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!payload || typeof payload !== "object") return null;

  const data = payload.type === "PLAYER_EVENT" && payload.data ? payload.data : payload;
  if (!data || typeof data !== "object") return null;

  const currentTime =
    typeof data.currentTime === "number"
      ? data.currentTime
      : typeof data.timestamp === "number" && data.timestamp < 10_000_000_000
        ? data.timestamp
        : NaN;
  const duration = typeof data.duration === "number" ? data.duration : NaN;
  const progress = typeof data.progress === "number" ? data.progress : NaN;
  const mediaType = data.mediaType ?? data.type;
  const id = data.id;

  if (!id) return null;
  if (mediaType !== "movie" && mediaType !== "tv" && mediaType !== "anime") return null;
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) return null;

  return {
    event: data.event,
    currentTime,
    duration,
    progress: Number.isFinite(progress) ? progress : (currentTime / duration) * 100,
    id,
    mediaType,
    season: typeof data.season === "number" ? data.season : undefined,
    episode: typeof data.episode === "number" ? data.episode : undefined,
  };
}

function buildSrc(source: Source, props: Props, resumeFrom: number): string {
  const { id, type, season, episode, color = "f0a23b", tmdbAlt } = props;

  if (type === "anime") {
    if (source === "videasy") {
      const base = episode
        ? `https://player.videasy.net/anime/${id}/${episode}`
        : `https://player.videasy.net/anime/${id}`;
      const params = new URLSearchParams({ color });
      if (episode) {
        params.set("nextEpisode", "true");
        params.set("episodeSelector", "true");
      }
      params.set("progress", String(Math.max(0, resumeFrom)));
      return `${base}?${params.toString()}`;
    }
    // source === "vidsrc": use the TMDB fallback (caller guarantees tmdbAlt exists
    // when "vidsrc" is selected for anime). For TV-format anime we don't know the
    // TMDB season layout, so default to season 1. Best-effort for long runners.
    return tmdbAlt!.type === "movie"
      ? `https://vidsrc.mov/embed/movie/${tmdbAlt!.id}`
      : `https://vidsrc.mov/embed/tv/${tmdbAlt!.id}/1/${episode ?? 1}`;
  }

  if (source === "vidsrc") {
    // vidsrc takes no player params and posts no progress events.
    return type === "tv"
      ? `https://vidsrc.mov/embed/tv/${id}/${season}/${episode}`
      : `https://vidsrc.mov/embed/movie/${id}`;
  }

  // videasy for movies/tv
  const base =
    type === "tv"
      ? `https://player.videasy.net/tv/${id}/${season}/${episode}`
      : `https://player.videasy.net/movie/${id}`;
  const params = new URLSearchParams({ color });
  if (type === "tv") {
    params.set("nextEpisode", "true");
    params.set("episodeSelector", "true");
  }
  params.set("progress", String(Math.max(0, resumeFrom)));
  return `${base}?${params.toString()}`;
}

export function Player(props: Props) {
  const { id, type, title, poster, backdrop, season, episode, cast = [], tmdbAlt } = props;
  const isAnime = type === "anime";
  const animeHasTmdbFallback = isAnime && !!tmdbAlt;
  const showSourceSwitcher = !isAnime || animeHasTmdbFallback;
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();

  const SOURCES: { id: Source; label: string }[] =
    isAnime && !animeHasTmdbFallback
      ? [{ id: "videasy", label: "Videasy" }]
      : [
          { id: "videasy", label: "Videasy" },
          { id: "vidsrc", label: "VidSrc" },
        ];

  const [resumeFrom, setResumeFrom] = useState<number | null>(null);
  // Default to videasy (the only source that reports progress). Users can switch
  // via the source toggle and the choice is remembered per category (anime vs
  // movies/tv) in localStorage.
  const [source, setSource] = useState<Source>("videasy");
  const [showFallbackHint, setShowFallbackHint] = useState(false);
  const [autoFallbackToast, setAutoFallbackToast] = useState<string | null>(null);
  const lastSavedAt = useRef(0);
  const receivedEventRef = useRef(false);
  const autoFallbackUsedRef = useRef(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAnime && !animeHasTmdbFallback) {
      setSource("videasy");
    } else {
      const key = isAnime ? ANIME_SOURCE_PREF_KEY : SOURCE_PREF_KEY;
      try {
        const saved = window.localStorage.getItem(key) as Source | null;
        setSource(saved === "vidsrc" ? "vidsrc" : "videasy");
      } catch {
        /* ignore */
      }
    }
    const w = getWatched(id, type, season, episode);
    if (w && w.currentTime > 5 && w.progress < 95) {
      setResumeFrom(Math.floor(w.currentTime));
    } else {
      setResumeFrom(0);
    }
  }, [id, type, season, episode, isAnime]);

  const src = useMemo(() => {
    if (resumeFrom === null) return null;
    return buildSrc(source, props, resumeFrom);
  }, [source, resumeFrom, props]);

  useEffect(() => {
    if (!src) return;
    receivedEventRef.current = false;
    setShowFallbackHint(false);
    setIsPaused(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    if (autoFallbackTimerRef.current) clearTimeout(autoFallbackTimerRef.current);

    // vidsrc never posts events, so silence from it isn't a failure signal.
    if (source !== "videasy") return;

    hintTimerRef.current = setTimeout(() => {
      if (!receivedEventRef.current) setShowFallbackHint(true);
    }, FALLBACK_HINT_AFTER_MS);

    // After a longer timeout with still no `play`/`timeupdate`, automatically
    // switch to vidsrc, but only once per page load and only when it's available.
    autoFallbackTimerRef.current = setTimeout(() => {
      if (receivedEventRef.current) return;
      if (autoFallbackUsedRef.current) return;
      const canSwitch = !isAnime || animeHasTmdbFallback;
      if (!canSwitch) return;
      autoFallbackUsedRef.current = true;
      // Not persisted: vidsrc can't track progress, so one slow load shouldn't
      // make it the remembered default.
      setSource("vidsrc");
      setAutoFallbackToast("Switched to VidSrc. Videasy didn't respond.");
    }, AUTO_FALLBACK_AFTER_MS);

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (autoFallbackTimerRef.current) clearTimeout(autoFallbackTimerRef.current);
    };
  }, [src, isAnime, animeHasTmdbFallback, source]);

  // Auto-dismiss the toast after a few seconds.
  useEffect(() => {
    if (!autoFallbackToast) return;
    const t = setTimeout(() => setAutoFallbackToast(null), 4500);
    return () => clearTimeout(t);
  }, [autoFallbackToast]);

  // Reset the once-per-page auto-fallback budget when the user navigates to a
  // different episode/movie.
  useEffect(() => {
    autoFallbackUsedRef.current = false;
  }, [id, season, episode]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const normalized = normalizeMessage(e.data);
      if (!normalized) return;
      if (
        String(normalized.id) !== String(id) ||
        normalized.mediaType !== type
      )
        return;

      receivedEventRef.current = true;
      setShowFallbackHint(false);

      // Track pause/play to surface the cast panel.
      if (normalized.event === "pause") setIsPaused(true);
      else if (normalized.event === "play" || normalized.event === "ended") setIsPaused(false);

      // Sync URL when the player auto-advances to a new episode (TV / anime).
      // Without this, our SeasonPicker / page header / browser-back would all
      // be stuck on the original episode while the iframe plays a different one.
      const evtSeason = normalized.season;
      const evtEpisode = normalized.episode;
      if (type === "tv" && evtSeason && evtEpisode) {
        if (evtSeason !== season || evtEpisode !== episode) {
          router.replace(`/tv/${id}/watch?s=${evtSeason}&e=${evtEpisode}`, { scroll: false });
        }
      } else if (type === "anime" && evtEpisode && evtEpisode !== episode) {
        router.replace(`/anime/${id}/watch?e=${evtEpisode}`, { scroll: false });
      }

      const now = Date.now();
      if (normalized.event === "timeupdate" && now - lastSavedAt.current < 5000) return;
      lastSavedAt.current = now;

      const item: WatchedItem = {
        id,
        type,
        title,
        poster,
        backdrop,
        progress: normalized.progress,
        currentTime: normalized.currentTime,
        duration: normalized.duration,
        season: type === "tv" ? normalized.season ?? season : undefined,
        episode: type !== "movie" ? normalized.episode ?? episode : undefined,
        updatedAt: now,
      };
      upsertWatched(item);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [
    id,
    type,
    title,
    poster,
    backdrop,
    season,
    episode,
    router,
  ]);

  function switchSource(next: Source) {
    if (next === source) return;
    if (isAnime && !animeHasTmdbFallback) return;
    setSource(next);
    try {
      window.localStorage.setItem(
        isAnime ? ANIME_SOURCE_PREF_KEY : SOURCE_PREF_KEY,
        next,
      );
    } catch {
      /* ignore */
    }
  }

  if (!src) {
    return <div className="aspect-video w-full bg-surface-2 shimmer" />;
  }

  const boxMotion = {
    initial: reduce ? false : ({ opacity: 0, x: -16 } as const),
    animate: { opacity: 1, x: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, x: 16 },
    transition: { duration: 0.45, ease: EASE_CINEMA },
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        {showSourceSwitcher && (
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] uppercase tracking-wider text-text-dim sm:inline">Source</span>
            <div role="radiogroup" aria-label="Video source" className="inline-flex border border-border bg-surface p-0.5">
              {SOURCES.map((s) => {
                const active = source === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => switchSource(s.id)}
                    className={`relative px-3.5 py-1.5 text-xs font-medium transition-colors duration-300 active:scale-[0.98] ${
                      active ? "text-on-brand" : "text-text-dim hover:text-text"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId={`source-indicator-${type}`}
                        aria-hidden
                        className="absolute inset-0 bg-brand"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2 text-xs text-text-dim">
          <AudioInfo isAnime={isAnime} />
        </div>
      </div>

      <AdBlockerHint />

      <div className="relative aspect-video w-full overflow-hidden bg-black shadow-[0_0_0_1px_var(--color-border),0_40px_80px_-24px_rgb(0_0_0/0.9)]">
        <iframe
          key={`${source}-${id}-${season ?? 0}-${episode ?? 0}`}
          src={src}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="no-referrer"
          title={title}
        />
      </div>

      <AnimatePresence initial={false}>
        {autoFallbackToast && (
          <motion.div
            key="auto-fallback"
            role="status"
            {...boxMotion}
            className="mt-3 flex items-center gap-3 border-l-2 border-brand bg-surface px-4 py-3 text-xs text-text sm:text-sm"
          >
            <ArrowsClockwiseIcon className="size-4 shrink-0 text-brand" weight="bold" aria-hidden />
            <span className="flex-1">{autoFallbackToast}</span>
            <button
              type="button"
              onClick={() => setAutoFallbackToast(null)}
              aria-label="Dismiss"
              className="shrink-0 p-1 text-text-dim transition-colors hover:text-text"
            >
              <XIcon className="size-3.5" weight="bold" aria-hidden />
            </button>
          </motion.div>
        )}

        {showFallbackHint && showSourceSwitcher && (
          <motion.div
            key="fallback-hint"
            {...boxMotion}
            className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-sm"
          >
            <span className="text-text-dim">Taking a while to load? Try the other source.</span>
            <button
              type="button"
              onClick={() => switchSource(source === "vidsrc" ? "videasy" : "vidsrc")}
              className="bg-brand px-4 py-2 text-xs font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
            >
              Switch to {source === "vidsrc" ? "Videasy" : "VidSrc"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CastOnPause visible={isPaused} cast={cast} source={isAnime ? "anilist" : "tmdb"} />
    </div>
  );
}

function AudioInfo({ isAnime }: { isAnime: boolean }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const text = isAnime
    ? "Sub & dub: when both are available, choose your audio from the gear icon inside the player. Videasy auto-detects what's offered."
    : "Audio language (sub / dub): when multiple tracks are available for a title, pick one from the gear / settings icon inside the player.";
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 ring-1 ring-inset transition active:scale-[0.98] ${
          open ? "bg-white text-bg ring-white" : "ring-white/25 hover:bg-white hover:text-bg"
        }`}
      >
        <InfoIcon className="size-3.5" weight="bold" aria-hidden />
        <span>{isAnime ? "Sub / Dub" : "Audio"}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 8, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_CINEMA }}
            className="absolute right-0 z-20 mt-2 w-[min(18rem,calc(100vw-2rem))] origin-top-right border border-border border-t-brand bg-surface p-4 text-xs leading-relaxed text-text-dim shadow-[0_24px_48px_-12px_rgb(0_0_0/0.8)]"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
