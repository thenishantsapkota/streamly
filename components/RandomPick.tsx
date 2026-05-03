"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RandomPick() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  async function pick() {
    setSpinning(true);
    try {
      const res = await fetch("/api/tmdb/trending/all/week");
      const data = await res.json();
      const items = data.results ?? [];
      if (items.length === 0) return;
      const item = items[Math.floor(Math.random() * items.length)];
      const type = item.media_type === "tv" ? "tv" : "movie";
      router.push(`/${type}/${item.id}`);
    } catch {
      /* ignore */
    } finally {
      setSpinning(false);
    }
  }

  return (
    <button
      type="button"
      onClick={pick}
      disabled={spinning}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface hover:bg-surface-2 px-4 py-2 text-sm font-medium text-text-dim hover:text-white transition disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={`size-4 ${spinning ? "animate-spin" : ""}`}
      >
        {spinning ? (
          <>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
      {spinning ? "Picking..." : "Surprise me"}
    </button>
  );
}
