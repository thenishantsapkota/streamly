"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { EASE_CINEMA } from "./motion";

/**
 * Underlined text tabs linking sibling listing pages. The active tab gets an
 * amber underline that draws in from the left.
 */
export function CategoryTabs({ group }: { group: keyof typeof GROUPS }) {
  const tabs = GROUPS[group];
  const pathname = usePathname();
  const reduce = useReducedMotion();
  return (
    <nav aria-label="Categories" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-6 sm:gap-8">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href} className="shrink-0">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`relative block pb-2 text-sm font-medium transition-colors ${
                  active ? "text-text" : "text-text-dim hover:text-text"
                }`}
              >
                {t.label}
                {active && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand"
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: EASE_CINEMA }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const MOVIE_TABS = [
  { href: "/movies", label: "Overview" },
  { href: "/movies/now-playing", label: "Now playing" },
  { href: "/movies/popular", label: "Popular" },
  { href: "/movies/top-rated", label: "Top rated" },
];

const TV_TABS = [
  { href: "/tv", label: "Overview" },
  { href: "/tv/airing-today", label: "Airing today" },
  { href: "/tv/popular", label: "Popular" },
  { href: "/tv/top-rated", label: "Top rated" },
];

const ANIME_TABS = [
  { href: "/anime", label: "Overview" },
  { href: "/anime/trending", label: "Trending" },
  { href: "/anime/popular", label: "Popular" },
  { href: "/anime/top-rated", label: "Top rated" },
];

const GROUPS = { movies: MOVIE_TABS, tv: TV_TABS, anime: ANIME_TABS };
