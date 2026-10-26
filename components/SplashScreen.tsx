"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { EASE_CINEMA } from "./motion";
import { MARK_ACCENT, MARK_BARS, MARK_LIGHT, MARK_PLAY, MARK_VIEWBOX } from "@/lib/brand-mark";
import { tmdbClient, anilistClient } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";

const SEEN_KEY = "splash-seen-v2";
let shouldPlay: boolean | null = null;

export function SplashScreen() {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in");
  const reduce = useReducedMotion();
  const queryClient = useQueryClient();

  // Prefetch home page data while the splash animation plays
  useEffect(() => {
    queryClient.prefetchQuery({ queryKey: qk.trending("week"), queryFn: () => tmdbClient.trending("week") });
    queryClient.prefetchQuery({ queryKey: qk.trending("day"), queryFn: () => tmdbClient.trending("day") });
    queryClient.prefetchQuery({ queryKey: qk.popularMovies(), queryFn: () => tmdbClient.popularMovies() });
    queryClient.prefetchQuery({ queryKey: qk.popularTv(), queryFn: () => tmdbClient.popularTv() });
    queryClient.prefetchQuery({ queryKey: qk.topRatedMovies(), queryFn: () => tmdbClient.topRatedMovies() });
    queryClient.prefetchQuery({ queryKey: qk.topRatedTv(), queryFn: () => tmdbClient.topRatedTv() });
    queryClient.prefetchQuery({ queryKey: qk.nowPlayingMovies(), queryFn: () => tmdbClient.nowPlayingMovies() });
    queryClient.prefetchQuery({ queryKey: qk.trendingAnime(), queryFn: () => anilistClient.trending(20) });
    queryClient.prefetchQuery({ queryKey: qk.popularAnime(), queryFn: () => anilistClient.popular(20) });
    queryClient.prefetchQuery({ queryKey: qk.bollywoodMovies(), queryFn: () => tmdbClient.discoverByCountry("movie", "IN") });
    queryClient.prefetchQuery({ queryKey: qk.bollywoodTv(), queryFn: () => tmdbClient.discoverByCountry("tv", "IN") });
  }, [queryClient]);

  useEffect(() => {
    // Decide once per page load; dev-mode effect double-runs must not see
    // the flag this same load just wrote.
    if (shouldPlay === null) {
      try {
        shouldPlay = window.sessionStorage.getItem(SEEN_KEY) !== "1";
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        shouldPlay = true;
      }
    }
    if (!shouldPlay || reduce) {
      setPhase("done");
      return;
    }
    const outTimer = setTimeout(() => setPhase("out"), 1600);
    const doneTimer = setTimeout(() => setPhase("done"), 2500);
    return () => {
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, [reduce]);

  if (phase === "done") return null;

  const letters = "STREAMLY".split("");

  // Letterbox: two bars that part vertically, revealing the page.
  return (
    <div className="pointer-events-none fixed inset-0 z-9999" aria-hidden>
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-bg"
        animate={phase === "out" ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.9, ease: EASE_CINEMA }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-bg"
        animate={phase === "out" ? { y: "100%" } : { y: 0 }}
        transition={{ duration: 0.9, ease: EASE_CINEMA }}
      />
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        animate={phase === "out" ? { opacity: 0, scale: 1.08 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_CINEMA }}
      >
        <svg viewBox={MARK_VIEWBOX} width={88} height={88} className="mb-6 overflow-visible" aria-hidden>
          <clipPath id="splash-top">
            <rect x="0" y="0" width="64" height="31" />
          </clipPath>
          <clipPath id="splash-bottom">
            <rect x="0" y="33" width="64" height="31" />
          </clipPath>
          <motion.path
            d={MARK_BARS}
            fill={MARK_LIGHT}
            fillRule="evenodd"
            clipPath="url(#splash-top)"
            initial={{ x: 28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE_CINEMA }}
          />
          <motion.path
            d={MARK_BARS}
            fill={MARK_LIGHT}
            fillRule="evenodd"
            clipPath="url(#splash-bottom)"
            initial={{ x: -28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE_CINEMA }}
          />
          <motion.path
            d={MARK_PLAY}
            fill={MARK_ACCENT}
            stroke={MARK_ACCENT}
            strokeWidth={1.6}
            strokeLinejoin="round"
            style={{ transformOrigin: "30px 32px" }}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.35 }}
          />
        </svg>
        <div className="flex overflow-hidden font-display text-4xl font-bold tracking-[0.2em] sm:text-6xl">
          {letters.map((l, i) => (
            <motion.span
              key={i}
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, delay: 0.4 + i * 0.04, ease: EASE_CINEMA }}
              className={i < 6 ? "text-white" : "text-brand"}
            >
              {l}
            </motion.span>
          ))}
        </div>
        <motion.span
          className="mt-4 h-px w-40 origin-left bg-brand"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: EASE_CINEMA }}
        />
      </motion.div>
    </div>
  );
}
