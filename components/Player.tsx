import { useEffect, useState } from "react";
import { getWatched, upsertWatched } from "@/lib/storage";
import { AdBlockerHint } from "./AdBlockerHint";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { InfoIcon } from "@phosphor-icons/react";
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
  /**
   * For anime: the TMDB equivalent, since vidsrc only knows TMDB ids.
   * Without it there is nothing to play.
   */
  tmdbAlt?: { id: number; type: "movie" | "tv" } | null;
};

function buildSrc({ id, type, season, episode, tmdbAlt }: Props): string | null {
  if (type === "anime") {
    if (!tmdbAlt) return null;
    // We don't know the TMDB season layout for TV-format anime, so default to
    // season 1. Best-effort for long runners.
    return tmdbAlt.type === "movie"
      ? `https://vidsrc.mov/embed/movie/${tmdbAlt.id}`
      : `https://vidsrc.mov/embed/tv/${tmdbAlt.id}/1/${episode ?? 1}`;
  }
  return type === "tv"
    ? `https://vidsrc.mov/embed/tv/${id}/${season}/${episode}`
    : `https://vidsrc.mov/embed/movie/${id}`;
}

export function Player(props: Props) {
  const { id, type, title, poster, backdrop, season, episode } = props;
  const src = buildSrc(props);

  // vidsrc posts no progress events, so record the title in history as soon
  // as it's opened. Keep any progress saved earlier for the same entry.
  useEffect(() => {
    if (!src) return;
    const prev = getWatched(id, type, season, episode);
    upsertWatched({
      id,
      type,
      title,
      poster,
      backdrop,
      progress: prev?.progress ?? 0,
      currentTime: prev?.currentTime ?? 0,
      duration: prev?.duration ?? 0,
      season: type === "tv" ? season : undefined,
      episode: type !== "movie" ? episode : undefined,
      updatedAt: Date.now(),
    });
  }, [src, id, type, title, poster, backdrop, season, episode]);

  if (!src) {
    return (
      <div className="grid aspect-video w-full place-items-center bg-surface-2 px-6 text-center text-sm text-text-dim">
        This title isn't available to stream right now.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 text-xs text-text-dim">
          <AudioInfo isAnime={type === "anime"} />
        </div>
      </div>

      <AdBlockerHint />

      <div className="relative aspect-video w-full overflow-hidden bg-black shadow-[0_0_0_1px_var(--color-border),0_40px_80px_-24px_rgb(0_0_0/0.9)]">
        <iframe
          key={src}
          src={src}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="no-referrer"
          title={title}
        />
      </div>
    </div>
  );
}

function AudioInfo({ isAnime }: { isAnime: boolean }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const text = isAnime
    ? "Sub & dub: when both are available, choose your audio from the settings icon inside the player."
    : "Audio language (sub / dub): when multiple tracks are available for a title, pick one from the gear / settings icon inside the player.";
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`rounded-btn inline-flex items-center gap-1.5 px-3 py-1.5 ring-1 ring-inset transition active:scale-[0.98] ${
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
