import { useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { Reveal, SplitTitle } from "@/components/motion";

const STALE_CHUNK = /dynamically imported module|Importing a module script failed|error loading dynamically/i;
const RELOAD_KEY = "stale-chunk-reload-at";

/**
 * A deploy replaces the hashed JS chunks, so a tab opened before it fails to
 * load the next route. Reload once (guarded against loops) to pick up the
 * new build instead of showing an error.
 */
function useReloadOnStaleChunk(error: Error) {
  const stale = STALE_CHUNK.test(error.message);
  useEffect(() => {
    if (!stale) return;
    try {
      const last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
      if (Date.now() - last < 30_000) return;
      window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      /* storage unavailable: still try once */
    }
    window.location.reload();
  }, [stale]);
  return stale;
}

export function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const stale = useReloadOnStaleChunk(error);
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6">
      <Reveal y={12}>
        <div className="flex items-center gap-3 tabular-nums text-xs text-text-dim">
          <span aria-hidden className="h-px w-10 bg-brand" />
          Reel jammed
        </div>
      </Reveal>
      <SplitTitle
        text="Something went wrong."
        delay={0.1}
        className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tighter sm:text-7xl lg:text-8xl"
      />
      <Reveal delay={0.3} y={12}>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-text-dim sm:text-base">
          {stale
            ? "Streamly was just updated. Reloading to get the latest version."
            : error.message || "This page failed to load. Try again, or come back in a minute."}
        </p>
        {error.digest && <p className="mt-2 tabular-nums text-xs text-text-dim/60">Ref {error.digest}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-btn group inline-flex items-center gap-2.5 bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
          >
            <ArrowCounterClockwiseIcon className="size-4 transition-transform duration-500 ease-cinema group-hover:-rotate-180" weight="bold" aria-hidden />
            Try again
          </button>
          <Link
            href="/"
            className="rounded-btn inline-flex items-center px-6 py-3 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-bg active:scale-[0.98]"
          >
            Go home
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
