"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getWatched, upsertWatched, type WatchedItem } from "@/lib/storage";
import { CastOnPause, type CastEntry } from "./CastOnPause";

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
   * For anime: optional TMDB fallback so vidking (which only knows TMDB IDs)
   * can be used as an alternate source. When present, the source switcher
   * is enabled for anime.
   */
  tmdbAlt?: { id: number; type: "movie" | "tv" } | null;
};

type Source = "vidking" | "videasy";

const SOURCE_PREF_KEY = "preferred-source-v1";
const FALLBACK_HINT_AFTER_MS = 12000;

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
  const { id, type, season, episode, color = "e50914", tmdbAlt } = props;

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
      if (resumeFrom > 0) params.set("progress", String(resumeFrom));
      return `${base}?${params.toString()}`;
    }
    // source === "vidking" — use the TMDB fallback (caller guarantees tmdbAlt exists
    // when "vidking" is selected for anime).
    const tmdbId = tmdbAlt!.id;
    const base =
      tmdbAlt!.type === "movie"
        ? `https://www.vidking.net/embed/movie/${tmdbId}`
        : // For TV-format anime we don't know the TMDB season layout, so default
          // to season 1. Long-running shows (One Piece etc.) split into many
          // TMDB seasons, so this is best-effort.
          `https://www.vidking.net/embed/tv/${tmdbId}/1/${episode ?? 1}`;
    const params = new URLSearchParams({ color, autoPlay: "false" });
    if (tmdbAlt!.type === "tv") {
      params.set("nextEpisode", "true");
      params.set("episodeSelector", "true");
    }
    if (resumeFrom > 0) params.set("progress", String(resumeFrom));
    return `${base}?${params.toString()}`;
  }

  if (source === "vidking") {
    const base =
      type === "tv"
        ? `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`
        : `https://www.vidking.net/embed/movie/${id}`;
    const params = new URLSearchParams({ color, autoPlay: "false" });
    if (type === "tv") {
      params.set("nextEpisode", "true");
      params.set("episodeSelector", "true");
    }
    if (resumeFrom > 0) params.set("progress", String(resumeFrom));
    return `${base}?${params.toString()}`;
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
  if (resumeFrom > 0) params.set("progress", String(resumeFrom));
  return `${base}?${params.toString()}`;
}

export function Player(props: Props) {
  const { id, type, title, poster, backdrop, season, episode, cast = [], tmdbAlt } = props;
  const isAnime = type === "anime";
  const animeHasTmdbFallback = isAnime && !!tmdbAlt;
  const showSourceSwitcher = !isAnime || animeHasTmdbFallback;
  const [isPaused, setIsPaused] = useState(false);

  const SOURCES: { id: Source; label: string }[] =
    isAnime && !animeHasTmdbFallback
      ? [{ id: "videasy", label: "Videasy" }]
      : [
          { id: "vidking", label: "Vidking" },
          { id: "videasy", label: "Videasy" },
        ];

  const [resumeFrom, setResumeFrom] = useState<number | null>(null);
  const [source, setSource] = useState<Source>(
    isAnime && !animeHasTmdbFallback ? "videasy" : "vidking",
  );
  const [showFallbackHint, setShowFallbackHint] = useState(false);
  const lastSavedAt = useRef(0);
  const receivedEventRef = useRef(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isAnime && !animeHasTmdbFallback) {
      setSource("videasy");
    } else {
      try {
        const saved = window.localStorage.getItem(SOURCE_PREF_KEY) as Source | null;
        if (saved === "vidking" || saved === "videasy") setSource(saved);
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
    hintTimerRef.current = setTimeout(() => {
      if (!receivedEventRef.current) setShowFallbackHint(true);
    }, FALLBACK_HINT_AFTER_MS);
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [src]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const normalized = normalizeMessage(e.data);
      if (!normalized) return;
      if (String(normalized.id) !== String(id) || normalized.mediaType !== type) return;

      receivedEventRef.current = true;
      setShowFallbackHint(false);

      // Track pause/play to surface the cast panel.
      if (normalized.event === "pause") setIsPaused(true);
      else if (normalized.event === "play" || normalized.event === "ended") setIsPaused(false);

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
  }, [id, type, title, poster, backdrop, season, episode]);

  function switchSource(next: Source) {
    if (next === source) return;
    if (isAnime && !animeHasTmdbFallback) return;
    setSource(next);
    try {
      window.localStorage.setItem(SOURCE_PREF_KEY, next);
    } catch {
      /* ignore */
    }
  }

  if (!src) {
    return <div className="aspect-video w-full rounded-lg bg-surface-2 shimmer" />;
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        {showSourceSwitcher && (
          <div className="inline-flex rounded-full border border-border bg-surface p-0.5">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => switchSource(s.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  source === s.id ? "bg-brand text-white" : "text-text-dim hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2 text-xs text-text-dim">
          <AudioInfo isAnime={isAnime} />
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-lg bg-black ring-1 ring-border aspect-video">
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

      {showFallbackHint && showSourceSwitcher && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
          <span className="text-text-dim">Having trouble loading? Try the alternate source.</span>
          <button
            type="button"
            onClick={() => switchSource(source === "vidking" ? "videasy" : "vidking")}
            className="rounded-full bg-brand hover:bg-brand-hover px-4 py-1.5 text-xs font-semibold text-white transition"
          >
            Switch to {source === "vidking" ? "Videasy" : "Vidking"}
          </button>
        </div>
      )}

      <CastOnPause visible={isPaused} cast={cast} source={isAnime ? "anilist" : "tmdb"} />
    </div>
  );
}

function AudioInfo({ isAnime }: { isAnime: boolean }) {
  const [open, setOpen] = useState(false);
  const text = isAnime
    ? "Sub & dub: when both are available, choose your audio from the gear icon inside the player. Videasy auto-detects what's offered."
    : "Audio language (sub / dub): when multiple tracks are available for a title, pick one from the gear / settings icon inside the player.";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 hover:text-white transition"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z" />
          <path d="M12 8v.01M11 12h1v4h1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{isAnime ? "Sub / Dub" : "Audio"}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-lg border border-border bg-surface p-3 text-xs text-text-dim shadow-2xl">
          {text}
        </div>
      )}
    </div>
  );
}
