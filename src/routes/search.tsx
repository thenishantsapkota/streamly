import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { PosterCard } from "@/components/PosterCard";
import { EASE_CINEMA, Reveal, SplitTitle, StaggerItem } from "@/components/motion";

type SearchResult = {
  id: number;
  kind: "movie" | "tv" | "anime";
  title: string;
  poster: string | null;
  rating: number;
  year: string;
  label: string;
};

type TabKey = "all" | "movie" | "tv" | "anime";
const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "movie", label: "Films" },
  { key: "tv", label: "Series" },
  { key: "anime", label: "Anime" },
];

const GRID = "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5";

function openSearch() {
  window.dispatchEvent(new Event("open-search"));
}

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: ({ match }) => {
    const q = match.search.q?.trim();
    return { meta: [{ title: q ? `${q} · Search · Streamly` : "Search · Streamly" }] };
  },
  component: SearchPage,
});

function SearchPage() {
  const query = (Route.useSearch().q ?? "").trim();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!query) { setResults([]); return; }
    setLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { setResults(d.results ?? []); setLoading(false); })
      .catch(() => setLoading(false));
    return () => ctrl.abort();
  }, [query]);

  const filtered = tab === "all" ? results : results.filter((r) => r.kind === tab);

  const counts: Record<TabKey, number> = {
    all: results.length,
    movie: results.filter((r) => r.kind === "movie").length,
    tv: results.filter((r) => r.kind === "tv").length,
    anime: results.filter((r) => r.kind === "anime").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 sm:pt-16">
      <header className="pb-8">
        {query ? (
          <>
            <SplitTitle
              key={query}
              text={query}
              className="max-w-4xl break-words text-4xl font-semibold leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl"
            />
            <Reveal delay={0.2} y={12} className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <p className="text-sm text-text-dim sm:text-base">Everything we found for your search, across films, series and anime.</p>
              <button
                type="button"
                onClick={openSearch}
                className="inline-flex items-center gap-2 text-sm text-text-dim transition-colors hover:text-brand"
              >
                <MagnifyingGlassIcon className="size-4" weight="bold" aria-hidden />
                New search
              </button>
            </Reveal>
          </>
        ) : (
          <>
            <SplitTitle text="Search" className="text-4xl font-semibold leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl" />
            <Reveal delay={0.2} y={12} className="mt-5">
              <p className="text-sm text-text-dim sm:text-base">Find a film, series or anime by title.</p>
            </Reveal>
          </>
        )}
      </header>

      {!query && (
        <Reveal className="flex flex-col items-center border border-dashed border-border px-6 py-16 text-center">
          <MagnifyingGlassIcon className="size-10 text-text-dim" weight="thin" aria-hidden />
          <p className="mt-4 max-w-sm text-sm text-text-dim">
            Type a title to start. Press <kbd className="bg-surface-2 px-1.5 py-0.5 text-xs text-text ring-1 ring-inset ring-border">/</kbd> anywhere to search.
          </p>
          <button
            type="button"
            onClick={openSearch}
            className="mt-6 inline-flex items-center gap-2 bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
          >
            <MagnifyingGlassIcon className="size-4" weight="bold" aria-hidden />
            Open search
          </button>
        </Reveal>
      )}

      {query && results.length > 0 && (
        <div role="tablist" aria-label="Filter results" className="no-scrollbar -mx-4 mb-10 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-6 sm:gap-8">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.key)}
                  className={`relative shrink-0 pb-3 text-sm font-medium transition-colors ${
                    active ? "text-text" : "text-text-dim hover:text-text"
                  }`}
                >
                  {t.label}
                  <span className="ml-1.5 tabular-nums text-xs text-text-dim">{counts[t.key]}</span>
                  {active && (
                    <motion.span
                      layoutId="search-tab-indicator"
                      aria-hidden
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-brand"
                      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE_CINEMA }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className={GRID}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="shimmer aspect-2/3" />
              <div className="shimmer mt-2.5 h-4 w-3/4" />
              <div className="shimmer mt-1.5 h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && query && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: EASE_CINEMA }}
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center border border-dashed border-border px-6 py-16 text-center">
                <MagnifyingGlassIcon className="size-10 text-text-dim" weight="thin" aria-hidden />
                <p className="mt-4 max-w-sm text-sm text-text-dim">
                  {tab === "all"
                    ? "No matches. Check the spelling or try a shorter title."
                    : `No ${TABS.find((t) => t.key === tab)?.label.toLowerCase()} matched this search.`}
                </p>
                {tab === "all" ? (
                  <button
                    type="button"
                    onClick={openSearch}
                    className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-bg active:scale-[0.98]"
                  >
                    Try another search
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTab("all")}
                    className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-bg active:scale-[0.98]"
                  >
                    Show all results
                  </button>
                )}
              </div>
            ) : (
              <div className={GRID}>
                {filtered.map((r, i) => (
                  <StaggerItem key={`${r.kind}-${r.id}`} index={i % 6}>
                    <PosterCard
                      href={`/${r.kind}/${r.id}`}
                      title={r.title}
                      poster={r.poster}
                      meta={[r.kind === "anime" ? "Anime" : r.kind === "tv" ? "Series" : "Film", r.year]}
                      rating={r.rating > 0 ? r.rating : null}
                      fluid
                    />
                  </StaggerItem>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
