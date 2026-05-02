"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [phase, setPhase] = useState<"in" | "zoom" | "done">("in");

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
