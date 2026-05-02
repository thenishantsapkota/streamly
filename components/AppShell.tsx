"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { RegisterSW } from "./RegisterSW";

const CHROMELESS_ROUTES = new Set(["/login"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chromeless = CHROMELESS_ROUTES.has(pathname);

  if (chromeless) return <>{children}</>;

  return (
    <>
      <RegisterSW />
      <Suspense fallback={<div className="fixed inset-x-0 top-0 z-50 h-16" />}>
        <Navbar />
      </Suspense>
      <main className="pt-16">{children}</main>
      <footer className="border-t border-border mt-24 py-8 text-center text-sm text-text-dim">
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
      </footer>
    </>
  );
}
