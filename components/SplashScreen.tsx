"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tmdbClient, anilistClient } from "@/lib/api-client";
import { qk } from "@/lib/query-keys";

export function SplashScreen() {
  const [phase, setPhase] = useState<"in" | "zoom" | "done">("in");
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
    const zoomTimer = setTimeout(() => setPhase("zoom"), 1200);
    const doneTimer = setTimeout(() => setPhase("done"), 2000);
    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-bg ${
        phase === "zoom" ? "splash-zoom-out" : ""
      }`}
    >
      <div className={`flex flex-col items-center gap-4 ${phase === "in" ? "splash-fade-in" : ""}`}>
        <svg width={64} height={64} viewBox="0 0 64 64" aria-hidden>
          <defs>
            <linearGradient id="splash-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1a1a22" />
              <stop offset="100%" stopColor="#0a0a0c" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#splash-bg)" />
          <path
            d="M16 18 L30 32 L16 46"
            stroke="#e50914"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="splash-stroke-draw"
          />
          <path
            d="M32 18 L46 32 L32 46"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="splash-stroke-draw splash-stroke-delay"
          />
        </svg>

        <span className="text-4xl font-bold tracking-tight select-none">
          <span className="text-brand">Stream</span>ly
        </span>
      </div>
    </div>
  );
}
