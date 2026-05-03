"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  id: number;
  type: "movie" | "tv";
  children: React.ReactNode;
};

/**
 * Wraps a card and, after hovering for 1.5s, shows a muted trailer
 * overlay fetched from the TMDB videos proxy.
 */
export function CardPreview({ id, type, children }: Props) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fetchedRef = useRef(false);

  function onEnter() {
    timerRef.current = setTimeout(() => {
      setShow(true);
      if (!fetchedRef.current) {
        fetchedRef.current = true;
        fetch(`/api/tmdb/${type}/${id}/videos`)
          .then((r) => r.json())
          .then((d) => {
            const vid = (d.results ?? []).find(
              (v: { site: string; type: string }) =>
                v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
            );
            if (vid) setTrailerKey(vid.key);
          })
          .catch(() => {});
      }
    }, 1500);
  }

  function onLeave() {
    clearTimeout(timerRef.current);
    setShow(false);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
      {show && trailerKey && (
        <div className="absolute inset-0 z-20 overflow-hidden rounded-lg pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&start=5`}
            title=""
            allow="autoplay"
            className="absolute inset-0 h-full w-full scale-150"
            tabIndex={-1}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
    </div>
  );
}
