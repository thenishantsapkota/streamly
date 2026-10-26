"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import {
  BookmarkSimpleIcon,
  ClockCounterClockwiseIcon,
  FilmSlateIcon,
  HouseSimpleIcon,
  MagnifyingGlassIcon,
  ShootingStarIcon,
  SquaresFourIcon,
  TelevisionSimpleIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { GENRES } from "@/lib/genres";
import { Logo } from "./Logo";
import { SearchOverlay } from "./SearchOverlay";
import { EASE_CINEMA } from "./motion";

const SECTIONS: { href: string; label: string; icon: Icon }[] = [
  { href: "/", label: "Home", icon: HouseSimpleIcon },
  { href: "/movies", label: "Films", icon: FilmSlateIcon },
  { href: "/tv", label: "Series", icon: TelevisionSimpleIcon },
  { href: "/anime", label: "Anime", icon: ShootingStarIcon },
];

/**
 * Wordmark at the top of the page, navigation in a floating dock at the
 * bottom. The dock is the one pill-shaped element in the system: it hides on
 * scroll-down, springs back on scroll-up, and an amber pill slides between
 * the active items.
 */
export function Navbar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(y - prev) < 4) return;
    setHidden(y > 160 && y > prev && !genresOpen);
  });

  useEffect(() => {
    setGenresOpen(false);
    setHidden(false);
  }, [pathname, params]);

  useEffect(() => {
    const onOpen = () => setSearchOpen(true);
    window.addEventListener("open-search", onOpen);
    return () => window.removeEventListener("open-search", onOpen);
  }, []);

  useEffect(() => {
    if (!genresOpen) return;
    function onDoc(e: MouseEvent) {
      if (!dockRef.current?.contains(e.target as Node)) setGenresOpen(false);
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setGenresOpen(false);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [genresOpen]);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  if (pathname === "/login") return null;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const genreActive = genresOpen || pathname.startsWith("/genre");

  return (
    <>
      {/* Top: wordmark only. Scrolls away with the page. */}
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Streamly home">
            <Logo size={30} className="text-base" />
          </Link>
          <Link
            href="/history"
            className={`group inline-flex items-center gap-2 text-sm transition-colors ${
              isActive("/history") ? "text-white" : "text-text-dim hover:text-white"
            }`}
          >
            <ClockCounterClockwiseIcon
              className="size-4 transition-transform duration-500 group-hover:-rotate-[360deg]"
              weight="bold"
              aria-hidden
            />
            History
          </Link>
        </div>
      </header>

      {/* Dock */}
      <motion.div
        ref={dockRef}
        initial={{ y: 120, opacity: 0 }}
        animate={hidden ? { y: 120, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 30, delay: hidden ? 0 : 0.05 }}
        className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3 sm:bottom-6"
      >
        <div className="relative">
          <AnimatePresence>
            {genresOpen && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                transition={{ duration: 0.35, ease: EASE_CINEMA }}
                className="absolute bottom-full left-1/2 mb-3 w-[min(92vw,560px)] -translate-x-1/2 origin-bottom border border-border bg-surface/95 p-5 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl"
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 sm:grid-cols-3">
                  {GENRES.map((g, i) => (
                    <motion.div
                      key={g.slug}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.015, ease: EASE_CINEMA }}
                    >
                      <Link
                        href={`/genre/${g.slug}`}
                        className={`block py-1.5 text-base tracking-tight transition-colors ${
                          pathname === `/genre/${g.slug}` ? "text-brand" : "text-white/75 hover:text-brand"
                        }`}
                      >
                        {g.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex gap-6 border-t border-border pt-4 text-sm">
                  <Link href="/trending" className="text-text-dim transition-colors hover:text-white">
                    Trending
                  </Link>
                  <Link href="/exclusives" className="text-text-dim transition-colors hover:text-white">
                    Exclusives
                  </Link>
                  <Link href="/country" className="text-text-dim transition-colors hover:text-white">
                    By country
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <nav
            aria-label="Main"
            className="flex items-center gap-0.5 rounded-full border border-white/10 bg-surface/80 p-1.5 shadow-[0_20px_50px_-10px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl"
          >
            {SECTIONS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href) && !genresOpen;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className={`relative flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors sm:px-4 ${
                    active ? "text-on-brand" : "text-text-dim hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dock-pill"
                      className="absolute inset-0 rounded-full bg-brand"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className="relative size-[18px]" weight={active ? "fill" : "bold"} aria-hidden />
                  <span className="relative hidden sm:inline">{label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setGenresOpen((o) => !o)}
              aria-expanded={genresOpen}
              aria-label="Genres"
              className={`relative flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors sm:px-4 ${
                genresOpen ? "text-on-brand" : genreActive ? "text-white" : "text-text-dim hover:text-white"
              }`}
            >
              {genresOpen && (
                <motion.span
                  layoutId="dock-pill"
                  className="absolute inset-0 rounded-full bg-brand"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <SquaresFourIcon
                className={`relative size-[18px] transition-transform duration-500 ${genresOpen ? "rotate-90" : ""}`}
                weight={genresOpen ? "fill" : "bold"}
                aria-hidden
              />
              <span className="relative hidden md:inline">Genres</span>
            </button>

            <span aria-hidden className="mx-1 h-5 w-px bg-white/10" />

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="group grid size-10 place-items-center rounded-full text-text-dim transition-colors hover:bg-white/5 hover:text-white"
            >
              <MagnifyingGlassIcon className="size-[18px] transition-transform duration-300 group-hover:scale-110" weight="bold" aria-hidden />
            </button>
            <Link
              href="/my-list"
              aria-label="My list"
              className={`group grid size-10 place-items-center rounded-full transition-colors hover:bg-white/5 ${
                isActive("/my-list") ? "text-brand" : "text-text-dim hover:text-white"
              }`}
            >
              <BookmarkSimpleIcon
                className="size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5"
                weight={isActive("/my-list") ? "fill" : "bold"}
                aria-hidden
              />
            </Link>
          </nav>
        </div>
      </motion.div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} initialQuery={params.get("q") ?? ""} />
    </>
  );
}
