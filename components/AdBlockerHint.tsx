"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ad-blocker-hint-dismissed-v1";

export function AdBlockerHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore quota errors */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="mb-2 flex items-start gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs sm:text-sm">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="mt-0.5 size-4 sm:size-5 shrink-0 text-text-dim"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
      <div className="min-w-0 flex-1 text-text-dim">
        The player may inject popup ads from third parties. Install an ad blocker like{" "}
        <a
          href="https://ublockorigin.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline-offset-4 hover:underline"
        >
          uBlock Origin
        </a>{" "}
        for the smoothest experience.
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="-mr-1 -mt-0.5 shrink-0 rounded-full p-1 text-text-dim transition hover:bg-surface-2 hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="size-4"
        >
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
