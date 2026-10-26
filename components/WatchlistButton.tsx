"use client";

import { useEffect, useState } from "react";
import { isInWatchlist, toggleWatchlist, type WatchlistItem } from "@/lib/watchlist";
import { toast } from "./Toast";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { EASE_CINEMA } from "./motion";

type Props = {
  item: WatchlistItem;
  className?: string;
};

export function WatchlistButton({ item, className = "" }: Props) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  // Bumped on each save so the amber sweep only plays on a real toggle.
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    setMounted(true);
    setSaved(isInWatchlist(item.id, item.type));
    const refresh = () => setSaved(isInWatchlist(item.id, item.type));
    window.addEventListener("watchlist-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("watchlist-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [item.id, item.type]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from My List" : "Add to My List"}
      aria-pressed={saved}
      onClick={() => {
        const nowSaved = toggleWatchlist(item);
        setSaved(nowSaved);
        if (nowSaved) setFlash((f) => f + 1);
        toast(nowSaved ? `Added "${item.title}" to My List` : `Removed from My List`);
      }}
      className={`group relative inline-flex items-center gap-2 overflow-hidden px-5 py-3 text-sm font-medium ring-1 ring-inset transition duration-300 active:scale-[0.98] ${
        saved
          ? "text-brand ring-brand/70 hover:bg-white hover:text-bg hover:ring-white"
          : "text-text ring-white/25 hover:bg-white hover:text-bg hover:ring-white"
      } ${className}`}
    >
      <span className="relative inline-flex size-4 items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={saved ? "check" : "plus"}
            className="absolute inset-0 inline-flex items-center justify-center"
            initial={reduce ? false : { opacity: 0, scale: 0.3, rotate: saved ? -90 : 90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3, rotate: saved ? 90 : -90 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 22 }}
          >
            {saved ? (
              <CheckIcon className="size-4" weight="bold" aria-hidden />
            ) : (
              <PlusIcon className="size-4 transition-transform duration-300 group-hover:rotate-90" weight="bold" aria-hidden />
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="relative inline-grid overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={saved ? "in" : "add"}
            className="col-start-1 row-start-1 whitespace-nowrap"
            initial={reduce ? false : { opacity: 0, x: saved ? 12 : -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: saved ? -12 : 12 }}
            transition={{ duration: 0.35, ease: EASE_CINEMA }}
          >
            {saved ? "In My List" : "My List"}
          </motion.span>
        </AnimatePresence>
      </span>
      {/* Amber flash sweeping across once on save. */}
      <AnimatePresence>
        {saved && flash > 0 && !reduce && (
          <motion.span
            key={flash}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-brand/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "250%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE_CINEMA }}
          />
        )}
      </AnimatePresence>
    </button>
  );
}
