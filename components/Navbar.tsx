"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { posterUrl } from "@/lib/tmdb";
import { Logo } from "./Logo";

type Suggestion = {
  id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  vote_average: number;
  year: string;
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setQ(params.get("q") ?? "");
    setOpen(false);
  }, [params]);

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
    router.push(`/${s.media_type}/${s.id}`);
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
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm transition-colors ${
          active ? "text-white" : "text-text-dim hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  const showDropdown = open && q.trim().length >= 2;

  if (pathname === "/login") return null;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled
          ? "bg-bg/85 backdrop-blur border-b border-border"
          : "bg-linear-to-b from-black/70 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-6">
        <Link href="/" aria-label="Streamly home">
          <Logo size={28} />
        </Link>
        <nav className="hidden sm:flex items-center gap-5">
          {link("/", "Home")}
          {link("/movies", "Movies")}
          {link("/tv", "TV Shows")}
          {link("/anime", "Anime")}
        </nav>
        <form onSubmit={onSubmit} className="ml-auto flex-1 max-w-sm">
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
                      const poster = posterUrl(s.poster_path, "w185");
                      const isActive = i === active;
                      return (
                        <li key={`${s.media_type}-${s.id}`}>
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
                                {s.media_type === "movie" ? "Movie" : "TV"}
                                {s.year ? ` · ${s.year}` : ""}
                                {s.vote_average ? ` · ★ ${s.vote_average.toFixed(1)}` : ""}
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
                        <span>See all results for “{q.trim()}”</span>
                        <span aria-hidden>→</span>
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </header>
  );
}
