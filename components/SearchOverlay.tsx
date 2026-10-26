
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/lib/router-compat";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRightIcon, StarIcon, XIcon } from "@phosphor-icons/react";
import { EASE_CINEMA } from "./motion";

type Suggestion = {
  id: number;
  kind: "movie" | "tv" | "anime";
  title: string;
  poster: string | null;
  rating: number;
  year: string;
  label: string;
};

/** Full-screen search: a large input with live results that cascade in below it. */
export function SearchOverlay({
  open,
  onClose,
  initialQuery = "",
}: {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ(initialQuery);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, initialQuery, onClose]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: Suggestion[] };
        setResults(data.results ?? []);
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
    onClose();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    if (active >= 0 && results[active]) return go(results[active]);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  }

  const term = q.trim();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-[70] overflow-y-auto bg-bg/95 backdrop-blur-2xl"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: EASE_CINEMA }}
        >
          <div className="mx-auto max-w-5xl px-4 pt-6 pb-20 sm:px-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="group inline-flex items-center gap-2 text-sm text-text-dim transition-colors hover:text-white"
              >
                Close
                <XIcon className="size-4 transition-transform duration-300 group-hover:rotate-90" weight="bold" aria-hidden />
              </button>
            </div>

            <motion.form
              onSubmit={onSubmit}
              className="mt-10 sm:mt-16"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: EASE_CINEMA }}
            >
              <label htmlFor="site-search" className="text-sm text-text-dim">
                Search films, series and anime
              </label>
              <input
                id="site-search"
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                placeholder="Start typing"
                className="mt-3 w-full border-b border-border bg-transparent pb-4 text-4xl font-semibold tracking-tight text-white placeholder:text-white/20 transition-colors focus:border-brand focus:outline-none sm:text-6xl"
              />
            </motion.form>

            <div className="mt-8">
              {term.length >= 2 && loading && results.length === 0 && (
                <p className="text-sm text-text-dim">Searching</p>
              )}
              {term.length >= 2 && !loading && results.length === 0 && (
                <p className="text-sm text-text-dim">Nothing matches &ldquo;{term}&rdquo;.</p>
              )}
              <ul>
                {results.map((s, i) => (
                  <motion.li
                    key={`${s.kind}-${s.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.035, ease: EASE_CINEMA }}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(s)}
                      className="group flex w-full items-center gap-5 border-b border-border py-3 text-left"
                    >
                      <div className="h-20 w-14 shrink-0 overflow-hidden bg-surface-2">
                        {s.poster && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.poster}
                            alt=""
                            className={`h-full w-full object-cover transition duration-500 ${i === active ? "scale-110" : ""}`}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-xl font-medium tracking-tight transition-colors sm:text-2xl ${
                            i === active ? "text-brand" : "text-white"
                          }`}
                        >
                          {s.title}
                        </div>
                        <div className="mt-1 flex items-center gap-3 tabular-nums text-xs uppercase text-text-dim">
                          <span>{s.label}</span>
                          {s.year && <span>{s.year}</span>}
                          {s.rating ? (
                            <span className="inline-flex items-center gap-1">
                              <StarIcon className="size-3" weight="fill" aria-hidden />
                              {s.rating.toFixed(1)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <ArrowRightIcon
                        className={`size-5 shrink-0 transition duration-300 ${
                          i === active ? "translate-x-0 text-brand opacity-100" : "-translate-x-3 opacity-0"
                        }`}
                        weight="bold"
                        aria-hidden
                      />
                    </button>
                  </motion.li>
                ))}
              </ul>
              {results.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(term)}`);
                    onClose();
                  }}
                  className="group mt-6 inline-flex items-center gap-2 text-sm text-text-dim transition-colors hover:text-brand"
                >
                  All results for &ldquo;{term}&rdquo;
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" weight="bold" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
