import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/router-compat";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from "@/lib/watchlist";
import { toast } from "@/components/Toast";
import { EASE_CINEMA, Reveal, SplitTitle } from "@/components/motion";
import { ArrowRightIcon, BookmarkSimpleIcon, StarIcon, XIcon } from "@phosphor-icons/react";

type Filter = "all" | WatchlistItem["type"];
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "movie", label: "Films" },
  { key: "tv", label: "Series" },
  { key: "anime", label: "Anime" },
];

const GRID = "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5";

function kindLabel(t: WatchlistItem["type"]) {
  return t === "movie" ? "Film" : t === "tv" ? "Series" : "Anime";
}

export const Route = createFileRoute("/my-list")({
  head: () => ({ meta: [{ title: "My list · Streamly" }] }),
  component: MyListPage,
});

function MyListPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const refresh = () => setItems(getWatchlist());
    refresh();
    window.addEventListener("watchlist-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("watchlist-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const counts: Record<Filter, number> = {
    all: items.length,
    movie: items.filter((i) => i.type === "movie").length,
    tv: items.filter((i) => i.type === "tv").length,
    anime: items.filter((i) => i.type === "anime").length,
  };
  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="pt-10 pb-12 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="pb-8">
          <SplitTitle text="My list" className="text-4xl font-semibold leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl" />
          <Reveal delay={0.2} y={12} className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <p className="max-w-xl text-sm text-text-dim sm:text-base">Everything you saved to watch later.</p>
            {mounted && items.length > 0 && (
              <span className="tabular-nums text-xs text-text-dim">
                {items.length} title{items.length === 1 ? "" : "s"}
              </span>
            )}
          </Reveal>
        </header>

        {!mounted && (
          <div className={GRID}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="shimmer aspect-2/3" />
                <div className="shimmer mt-2.5 h-4 w-3/4" />
                <div className="shimmer mt-1.5 h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {mounted && items.length === 0 && (
          <Reveal className="flex flex-col items-center border border-dashed border-border px-6 py-16 text-center">
            <BookmarkSimpleIcon className="size-10 text-text-dim" weight="thin" aria-hidden />
            <p className="mt-4 max-w-sm text-sm text-text-dim">
              Nothing saved yet. Tap the bookmark on any title to keep it here.
            </p>
            <Link
              href="/"
              className="rounded-btn group mt-6 inline-flex items-center gap-2 bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
            >
              Find something to watch
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" aria-hidden />
            </Link>
          </Reveal>
        )}

        {mounted && items.length > 0 && (
          <>
            <div role="tablist" aria-label="Filter list" className="no-scrollbar -mx-4 mb-10 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <div className="inline-flex divide-x divide-border border border-border">
                {FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter(f.key)}
                      className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
                        active ? "text-on-brand" : "text-text-dim hover:bg-surface hover:text-text"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="mylist-filter"
                          aria-hidden
                          className="absolute inset-0 bg-brand"
                          transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE_CINEMA }}
                        />
                      )}
                      <span className="relative">
                        {f.label}
                        <span className={`ml-1.5 tabular-nums text-xs ${active ? "text-on-brand/60" : "text-text-dim"}`}>
                          {counts[f.key]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="flex flex-col items-center border border-dashed border-border px-6 py-16 text-center">
                <BookmarkSimpleIcon className="size-10 text-text-dim" weight="thin" aria-hidden />
                <p className="mt-4 text-sm text-text-dim">
                  No {FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} saved yet.
                </p>
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="rounded-btn mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-bg active:scale-[0.98]"
                >
                  Show everything
                </button>
              </div>
            ) : (
              <motion.ul layout={!reduce} className={GRID}>
                <AnimatePresence initial={false} mode="popLayout">
                  {visible.map((item, i) => {
                    const href = `/${item.type}/${item.id}`;
                    return (
                      <motion.li
                        key={`${item.type}-${item.id}`}
                        layout={!reduce}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 32 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, filter: "blur(4px)" }}
                        transition={{ duration: 0.5, delay: reduce ? 0 : Math.min(i % 6, 5) * 0.04, ease: EASE_CINEMA }}
                        className="group relative"
                      >
                        <Link href={href} className="block">
                          <div className="relative aspect-2/3 overflow-hidden bg-surface-2 shadow-[0_0_0_1px_var(--color-border)] transition-shadow duration-500 group-hover:shadow-[0_24px_48px_-12px_rgb(0_0_0/0.8)]">
                            {item.poster ? (
                              <img
                                src={item.poster}
                                alt={item.title}
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-700 ease-cinema group-hover:scale-105 group-hover:brightness-75"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-text-dim">
                                {item.title}
                              </div>
                            )}
                            {item.rating > 0 && (
                              <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-bg/80 px-1.5 py-0.5 tabular-nums text-xs text-brand backdrop-blur">
                                <StarIcon className="size-3" weight="fill" aria-hidden />
                                {item.rating.toFixed(1)}
                              </div>
                            )}
                            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brand transition-transform duration-500 ease-cinema group-hover:scale-x-100" />
                          </div>
                          <div className="mt-2.5">
                            <div className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-brand">{item.title}</div>
                            <div className="mt-0.5 tabular-nums text-[11px] uppercase text-text-dim">
                              {[item.year, kindLabel(item.type)].filter(Boolean).join(" / ")}
                            </div>
                          </div>
                        </Link>
                        <button
                          type="button"
                          aria-label={`Remove ${item.title} from list`}
                          onClick={() => {
                            removeFromWatchlist(item.id, item.type);
                            setItems(getWatchlist());
                            toast("Removed from your list", "info");
                          }}
                          className="absolute right-2 top-2 grid size-8 place-items-center bg-bg/80 text-text backdrop-blur transition hover:bg-white hover:text-bg active:scale-95 [@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        >
                          <XIcon className="size-3.5" weight="bold" aria-hidden />
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
