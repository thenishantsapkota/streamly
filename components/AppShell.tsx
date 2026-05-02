"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { RegisterSW } from "./RegisterSW";
import { SplashScreen } from "./SplashScreen";
import { BackToTop } from "./BackToTop";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { QueryProvider } from "./QueryProvider";

const CHROMELESS_ROUTES = new Set(["/login"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chromeless = CHROMELESS_ROUTES.has(pathname);

  if (chromeless) return <>{children}</>;

  return (
    <QueryProvider>
      <SplashScreen />
      <RegisterSW />
      <KeyboardShortcuts />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-white">
        Skip to content
      </a>
      <Suspense fallback={<div className="fixed inset-x-0 top-0 z-50 h-16" />}>
        <Navbar />
      </Suspense>
      <main id="main-content" className="pt-16">{children}</main>
      <BackToTop />
      <footer className="border-t border-border mt-24 py-10 text-sm text-text-dim">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Browse</h3>
              <ul className="space-y-2">
                <li><a href="/movies" className="hover:text-white transition">Movies</a></li>
                <li><a href="/tv" className="hover:text-white transition">TV Shows</a></li>
                <li><a href="/anime" className="hover:text-white transition">Anime</a></li>
                <li><a href="/trending" className="hover:text-white transition">Trending</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Discover</h3>
              <ul className="space-y-2">
                <li><a href="/genre/action" className="hover:text-white transition">Action</a></li>
                <li><a href="/genre/comedy" className="hover:text-white transition">Comedy</a></li>
                <li><a href="/genre/drama" className="hover:text-white transition">Drama</a></li>
                <li><a href="/country" className="hover:text-white transition">By Country</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Categories</h3>
              <ul className="space-y-2">
                <li><a href="/movies/now-playing" className="hover:text-white transition">Now Playing</a></li>
                <li><a href="/movies/top-rated" className="hover:text-white transition">Top Rated</a></li>
                <li><a href="/tv/airing-today" className="hover:text-white transition">Airing Today</a></li>
                <li><a href="/exclusives" className="hover:text-white transition">Exclusives</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">My Streamly</h3>
              <ul className="space-y-2">
                <li><a href="/my-list" className="hover:text-white transition">My List</a></li>
                <li><a href="/search" className="hover:text-white transition">Search</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center">
            <p className="inline-flex items-center justify-center gap-1.5">
              <span>Developed with</span>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-label="love"
                className="size-4 text-brand"
              >
                <path d="M12 21s-7.5-4.55-10-10A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 10 5c-2.5 5.45-10 10-10 10Z" />
              </svg>
              <span>by</span>
              <a
                href="https://snishant.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline-offset-4 hover:underline"
              >
                Nishant
              </a>
              <span>.</span>
            </p>
            <p className="mt-2 text-xs">
              For personal use only — not for commercial use. This product uses the TMDB and AniList APIs but is not endorsed or certified by either.
            </p>
          </div>
        </div>
      </footer>
    </QueryProvider>
  );
}
