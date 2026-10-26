import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/router-compat";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getRecentlyWatched, removeWatched, clearWatched, type WatchedItem } from "@/lib/storage";
import { toast } from "@/components/Toast";
import { EASE_CINEMA, Reveal, SplitTitle } from "@/components/motion";
import { ArrowRightIcon, ClockCounterClockwiseIcon, PlayIcon, XIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Watch history · Streamly" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const refresh = () => setItems(getRecentlyWatched());
    refresh();
    window.addEventListener("recently-watched-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("recently-watched-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className="pt-10 pb-12 sm:pt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <header className="pb-8">
          <SplitTitle text="Watch history" className="text-4xl font-semibold leading-[0.98] tracking-tighter sm:text-6xl lg:text-7xl" />
          <Reveal delay={0.2} y={12} className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <p className="max-w-xl text-sm text-text-dim sm:text-base">Pick up where you left off. Saved on this device only.</p>
            {mounted && items.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="tabular-nums text-xs text-text-dim">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearWatched();
                    setItems([]);
                    toast("Watch history cleared");
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-bg active:scale-[0.98]"
                >
                  Clear all
                </button>
              </div>
            )}
          </Reveal>
        </header>

        {!mounted && (
          <div className="divide-y divide-border border-y border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <div className="shimmer aspect-video w-32 shrink-0 sm:w-48" />
                <div className="flex-1">
                  <div className="shimmer h-5 w-2/3" />
                  <div className="shimmer mt-2 h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {mounted && items.length === 0 && (
          <Reveal className="flex flex-col items-center border border-dashed border-border px-6 py-16 text-center">
            <ClockCounterClockwiseIcon className="size-10 text-text-dim" weight="thin" aria-hidden />
            <p className="mt-4 max-w-sm text-sm text-text-dim">
              Nothing watched yet. Anything you play will show up here so you can resume it.
            </p>
            <Link
              href="/"
              className="group mt-6 inline-flex items-center gap-2 bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
            >
              Start watching
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" aria-hidden />
            </Link>
          </Reveal>
        )}

        {mounted && items.length > 0 && (
          <motion.ul layout={!reduce} className="border-t border-border">
            <AnimatePresence initial={false}>
              {items.map((it, i) => {
                let href = `/${it.type}/${it.id}`;
                if (it.type === "tv" && it.season && it.episode) {
                  href = `/tv/${it.id}/watch?s=${it.season}&e=${it.episode}`;
                } else if (it.type === "anime" && it.episode) {
                  href = `/anime/${it.id}/watch?e=${it.episode}`;
                }
                const pct = Math.min(100, Math.max(0, Math.round(it.progress)));
                const timeAgo = getTimeAgo(new Date(it.updatedAt));
                const where =
                  it.type === "tv" && it.season && it.episode
                    ? `S${it.season} E${it.episode}`
                    : it.type === "anime" && it.episode
                      ? `Episode ${it.episode}`
                      : it.type === "movie"
                        ? "Film"
                        : it.type === "tv"
                          ? "Series"
                          : "Anime";

                return (
                  <motion.li
                    key={`${it.type}-${it.id}-${it.season}-${it.episode}`}
                    layout={!reduce}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: -48, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.5, delay: reduce ? 0 : Math.min(i, 8) * 0.04, ease: EASE_CINEMA }}
                    className="group relative border-b border-border"
                  >
                    <div className="flex items-center gap-4 py-4 sm:gap-6">
                      <Link href={href} className="relative w-32 shrink-0 sm:w-48" aria-label={`Resume ${it.title}`}>
                        <div className="relative aspect-video overflow-hidden bg-surface-2 shadow-[0_0_0_1px_var(--color-border)]">
                          {it.backdrop ? (
                            <img
                              src={it.backdrop}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-700 ease-cinema group-hover:scale-105 group-hover:brightness-50"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-text-dim">No image</div>
                          )}
                          <div className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
                            <span className="grid size-9 place-items-center bg-brand text-on-brand">
                              <PlayIcon className="size-4" weight="fill" aria-hidden />
                            </span>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15">
                            <motion.div
                              className="h-full origin-left bg-brand"
                              style={{ width: `${pct}%` }}
                              initial={reduce ? false : { scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.9, delay: 0.2, ease: EASE_CINEMA }}
                            />
                          </div>
                        </div>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={href} className="block">
                          <h2 className="line-clamp-2 text-base font-semibold tracking-tight transition-colors group-hover:text-brand sm:text-xl">
                            {it.title}
                          </h2>
                        </Link>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 tabular-nums text-xs text-text-dim">
                          <span className="text-text">{where}</span>
                          <span>{pct}% watched</span>
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${it.title} from history`}
                        onClick={() => {
                          removeWatched(it);
                          setItems(getRecentlyWatched());
                          toast("Removed from history");
                        }}
                        className="grid size-9 shrink-0 place-items-center text-text-dim ring-1 ring-inset ring-border transition hover:bg-white hover:text-bg hover:ring-white active:scale-95 [@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <XIcon className="size-4" weight="bold" aria-hidden />
                      </button>
                    </div>
                    <span aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-brand transition-transform duration-500 ease-cinema group-hover:scale-x-100" />
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
