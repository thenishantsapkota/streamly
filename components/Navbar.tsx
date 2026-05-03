"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { GENRES } from "@/lib/genres";

type Suggestion = {
  id: number;
  kind: "movie" | "tv" | "anime";
  title: string;
  poster: string | null;
  rating: number;
  year: string;
  label: string;
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [scrolled, setScrolled] = useState(false);

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGenresOpen, setMobileGenresOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const genreTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [genreHover, setGenreHover] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setQ(params.get("q") ?? "");
    setOpen(false);
    setMobileOpen(false);
    setMobileGenresOpen(false);
  }, [params, pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // debounced fetch of suggestions
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results: Suggestion[] };
        setSuggestions(data.results ?? []);
        setActive(-1);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  function go(s: Suggestion) {
    router.push(`/${s.kind}/${s.id}`);
    setOpen(false);
    inputRef.current?.blur();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    if (active >= 0 && suggestions[active]) {
      go(suggestions[active]);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const link = (href: string, label: string) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm transition-colors ${
          isActive ? "text-white" : "text-text-dim hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  const showDropdown = open && q.trim().length >= 2;

  if (pathname === "/login") return null;

  const genreMenuEnter = () => {
    clearTimeout(genreTimeout.current);
    setGenreHover(true);
  };
  const genreMenuLeave = () => {
    genreTimeout.current = setTimeout(() => setGenreHover(false), 150);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled
          ? "bg-bg/85 backdrop-blur border-b border-border"
          : "bg-linear-to-b from-black/70 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
        <Link href="/" aria-label="Streamly home" className="shrink-0">
          <Logo size={28} wordmarkResponsive />
        </Link>
        <nav className="hidden sm:flex items-center gap-5">
          {link("/", "Home")}
          {link("/movies", "Movies")}
          {link("/tv", "TV Shows")}
          {link("/anime", "Anime")}

          {/* Genres dropdown */}
          <div
            className="relative"
            onMouseEnter={genreMenuEnter}
            onMouseLeave={genreMenuLeave}
          >
            <button
              type="button"
              className={`text-sm transition-colors flex items-center gap-1 ${
                pathname.startsWith("/genre")
                  ? "text-white"
                  : "text-text-dim hover:text-white"
              }`}
            >
              Genres
              <svg
                className={`size-3.5 transition-transform ${genreHover ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {genreHover && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                <div className="w-[420px] rounded-xl border border-border bg-surface/95 backdrop-blur-xl shadow-2xl p-4">
                  <div className="grid grid-cols-3 gap-1">
                    {GENRES.map((g) => (
                      <Link
                        key={g.slug}
                        href={`/genre/${g.slug}`}
                        className={`rounded-lg px-3 py-2 text-sm transition ${
                          pathname === `/genre/${g.slug}`
                            ? "bg-brand/20 text-white"
                            : "text-text-dim hover:bg-surface-2 hover:text-white"
                        }`}
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-4">
                    <Link
                      href="/country"
                      className="text-sm text-text-dim hover:text-white transition flex items-center gap-1.5"
                    >
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      Browse by Country
                    </Link>
                    <Link
                      href="/trending"
                      className="text-sm text-text-dim hover:text-white transition flex items-center gap-1.5"
                    >
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Trending
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {link("/exclusives", "Exclusives")}
        </nav>
        <div className="hidden sm:flex ml-auto items-center gap-1">
          <Link
            href="/my-list"
            aria-label="My List"
            className={`inline-flex items-center justify-center size-9 rounded-full transition ${
              pathname === "/my-list"
                ? "text-white bg-surface-2"
                : "text-text-dim hover:text-white hover:bg-surface-2"
            }`}
          >
            <svg viewBox="0 0 24 24" fill={pathname === "/my-list" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="size-5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/history"
            aria-label="History"
            className={`inline-flex items-center justify-center size-9 rounded-full transition ${
              pathname === "/history"
                ? "text-white bg-surface-2"
                : "text-text-dim hover:text-white hover:bg-surface-2"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <form onSubmit={onSubmit} className="sm:ml-0 ml-auto flex-1 max-w-sm min-w-0">
          <div ref={wrapRef} className="relative">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Search movies, shows…"
              autoComplete="off"
              className="w-full h-9 rounded-full bg-surface-2 border border-border pl-9 pr-3 text-sm text-white placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 size-4 text-text-dim"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>

            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
                {loading && suggestions.length === 0 && (
                  <div className="px-3 py-3 text-sm text-text-dim">Searching…</div>
                )}
                {!loading && suggestions.length === 0 && (
                  <div className="px-3 py-3 text-sm text-text-dim">No matches.</div>
                )}
                {suggestions.length > 0 && (
                  <ul className="max-h-[60vh] overflow-y-auto py-1">
                    {suggestions.map((s, i) => {
                      const poster = s.poster;
                      const isActive = i === active;
                      return (
                        <li key={`${s.kind}-${s.id}`}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(i)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => go(s)}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                              isActive ? "bg-surface-2" : "hover:bg-surface-2"
                            }`}
                          >
                            <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-surface-2">
                              {poster ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={poster} alt="" className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{s.title}</div>
                              <div className="text-xs text-text-dim">
                                {s.label}
                                {s.year ? ` · ${s.year}` : ""}
                                {s.rating ? ` · ★ ${s.rating.toFixed(1)}` : ""}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                    <li className="border-t border-border">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          router.push(`/search?q=${encodeURIComponent(q.trim())}`);
                          setOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-text-dim hover:bg-surface-2 hover:text-white"
                      >
                        <span>See all results for "{q.trim()}"</span>
                        <span aria-hidden>→</span>
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </form>
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          className="sm:hidden -mr-1 inline-flex size-9 items-center justify-center rounded-full text-text-dim hover:text-white hover:bg-surface-2 transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
            {mobileOpen ? (
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-bg/95 backdrop-blur">
          <nav className="mx-auto max-w-7xl flex flex-col px-2 py-2">
            {[
              ["/", "Home"],
              ["/movies", "Movies"],
              ["/tv", "TV Shows"],
              ["/anime", "Anime"],
            ].map(([href, label]) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive ? "bg-surface-2 text-white" : "text-text-dim hover:bg-surface-2 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Genres accordion */}
            <button
              type="button"
              onClick={() => setMobileGenresOpen((o) => !o)}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                pathname.startsWith("/genre")
                  ? "bg-surface-2 text-white"
                  : "text-text-dim hover:bg-surface-2 hover:text-white"
              }`}
            >
              Genres
              <svg
                className={`size-4 transition-transform ${mobileGenresOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {mobileGenresOpen && (
              <div className="grid grid-cols-2 gap-1 px-1 py-1">
                {GENRES.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/genre/${g.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm transition ${
                      pathname === `/genre/${g.slug}`
                        ? "bg-brand/20 text-white"
                        : "text-text-dim hover:bg-surface-2 hover:text-white"
                    }`}
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {[
              ["/my-list", "My List"],
              ["/history", "History"],
              ["/country", "Country"],
              ["/trending", "Trending"],
              ["/exclusives", "Exclusives"],
            ].map(([href, label]) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive ? "bg-surface-2 text-white" : "text-text-dim hover:bg-surface-2 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
