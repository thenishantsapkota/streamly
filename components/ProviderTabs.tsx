"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MediaCard } from "./MediaCard";
import { DraggableScroll } from "./DraggableScroll";
import { RowHeader } from "./RowHeader";
import { EASE_CINEMA } from "./motion";
import type { Provider } from "@/lib/providers";
import { IMG, type MediaItem } from "@/lib/tmdb";

type Entry = { provider: Provider; items: MediaItem[] };

/**
 * One "Streaming exclusives" section: a switcher of services (each tab
 * shows the service's logo) driving a single poster row.
 */
export function ProviderTabs({ entries }: { entries: Entry[] }) {
  const list = entries.filter((e) => e.items.length > 0);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  if (!list.length) return null;
  const current = list[Math.min(active, list.length - 1)];

  return (
    <section className="mt-14">
      <RowHeader title="Streaming exclusives" href={`/exclusives#${current.provider.slug}`} />

      <div role="tablist" aria-label="Streaming service" className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-6">
        {list.map((e, i) => {
          const isActive = i === active;
          return (
            <button
              key={e.provider.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={`group relative flex shrink-0 items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-text-dim hover:text-white"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="provider-tab"
                  className="absolute inset-0 bg-surface-2 ring-1 ring-inset ring-white/10"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <img
                src={`${IMG}/w92${e.provider.logo}`}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                className={`relative size-6 object-cover ring-1 ring-white/10 transition duration-300 ${
                  isActive ? "scale-110" : "grayscale-[50%] opacity-70 group-hover:opacity-100"
                }`}
              />
              <span className="relative">{e.provider.name}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.provider.slug}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.45, ease: EASE_CINEMA }}
        >
          <p className="mt-4 px-4 text-sm text-text-dim sm:px-6">{current.provider.tagline}</p>
          <DraggableScroll className="no-scrollbar flex gap-4 overflow-x-auto px-4 pt-4 pb-4 sm:gap-5 sm:px-6">
            {current.items.map((item) => (
              <div key={item.id} className="shrink-0">
                <MediaCard item={item} forceType="movie" />
              </div>
            ))}
          </DraggableScroll>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
