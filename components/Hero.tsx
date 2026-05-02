"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { backdropUrl, getTitle, getYear, type MediaItem, type MediaType } from "@/lib/tmdb";

const AUTOPLAY_MS = 6000;

export function Hero({ items }: { items: MediaItem[] }) {
  const slides = items.filter((i) => i.backdrop_path).slice(0, 10);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    setPaused(false);
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goTo(index + 1);
    else goTo(index - 1);
  }

  const goTo = useCallback(
    (i: number) => {
      if (slides.length === 0) return;
      setIndex(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  // Autoplay
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  // Keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(index - 1);
      else if (e.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative h-[68vh] min-h-105 w-full overflow-hidden touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {slides.map((item, i) => {
        const type: MediaType = item.media_type === "tv" ? "tv" : "movie";
        const bg = backdropUrl(item.backdrop_path, "original");
        const title = getTitle(item);
        const active = i === index;
        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!active}
          >
            {bg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bg}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-8000 ease-out ${
                  active ? "scale-105" : "scale-100"
                }`}
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-bg/80 via-transparent to-transparent" />

            <div className="relative z-10 mx-auto max-w-7xl h-full px-4 sm:px-6 flex flex-col justify-end pb-20 sm:pb-28">
              <div className="max-w-2xl">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-dim">
                  <span className="rounded bg-brand/90 px-1.5 py-0.5 text-white">
                    #{i + 1} Trending
                  </span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">
                    {type === "movie" ? "Movie" : "TV"}
                  </span>
                  <span>{getYear(item)}</span>
                  {item.vote_average > 0 && <span>★ {item.vote_average.toFixed(1)}</span>}
                </div>
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight drop-shadow">{title}</h1>
                <p className="mt-3 line-clamp-3 text-sm sm:text-base text-text-dim">
                  {item.overview}
                </p>
                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/${type}/${item.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-5 py-2.5 text-sm font-semibold text-white transition"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play
                  </Link>
                  <Link
                    href={`/${type}/${item.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition"
                  >
                    More info
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 hover:bg-black/70 p-2.5 text-white backdrop-blur transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 hover:bg-black/70 p-2.5 text-white backdrop-blur transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {slides.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    active ? "w-8 bg-brand" : "w-3 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
