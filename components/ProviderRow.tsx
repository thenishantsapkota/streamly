import { Suspense } from "react";
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { Row } from "./Row";
import { RowSkeleton } from "./QueryRow";
import { Reveal } from "./motion";
import { IMG, type MediaItem } from "@/lib/tmdb";
import { apiQueryOr } from "@/lib/api";
import type { Provider } from "@/lib/providers";

type Props = {
  provider: Provider;
  /** Render condensed single-row variant (used on home) instead of the full
   *  movies + TV split (used on the exclusives page). */
  variant?: "condensed" | "full";
};

const EMPTY: { results: MediaItem[] } = { results: [] };

/** Popular titles on a provider; resolves to an empty page instead of throwing. */
export function providerQuery(type: "movie" | "tv", provider: Provider) {
  return apiQueryOr(EMPTY, "tmdb", "discoverByProvider", type, provider.id, provider.region);
}

/**
 * Popular movies (and optionally TV) on the given streaming provider, as one
 * or two `<Row>`s. Suspends behind a skeleton until the data is cached; prime
 * it in a route loader with `providerQuery(...)`.
 */
export function ProviderRow({ provider, variant = "condensed" }: Props) {
  if (variant === "condensed") {
    return (
      <Suspense fallback={<RowSkeleton />}>
        <CondensedProviderRow provider={provider} />
      </Suspense>
    );
  }
  return (
    <Suspense
      fallback={
        <section id={provider.slug} className="mt-20 scroll-mt-24 first-of-type:mt-8 [&>section]:mt-10" aria-hidden>
          <div className="px-4 sm:px-6">
            <div className="flex items-center gap-4 border-t border-border pt-6">
              <div className="size-10 shimmer sm:size-12" />
              <div className="h-9 w-48 shimmer sm:h-12" />
            </div>
          </div>
          <RowSkeleton />
          <RowSkeleton />
        </section>
      }
    >
      <FullProviderRow provider={provider} />
    </Suspense>
  );
}

function CondensedProviderRow({ provider }: { provider: Provider }) {
  const { data: movies } = useSuspenseQuery(providerQuery("movie", provider));
  if (!movies.results.length) return null;
  return (
    <Row
      title={`Exclusively on ${provider.name}`}
      items={movies.results}
      forceType="movie"
      viewAllHref={`/exclusives#${provider.slug}`}
    />
  );
}

function FullProviderRow({ provider }: { provider: Provider }) {
  const [{ data: movies }, { data: tv }] = useSuspenseQueries({
    queries: [providerQuery("movie", provider), providerQuery("tv", provider)],
  });

  if (!movies.results.length && !tv.results.length) return null;

  return (
    <section id={provider.slug} className="mt-20 scroll-mt-24 first-of-type:mt-8 [&>section]:mt-10">
      <Reveal className="px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t border-border pt-6">
          <div className="flex items-center gap-4">
            <img src={`${IMG}/w92${provider.logo}`} alt="" width={48} height={48} loading="lazy" className="size-10 shrink-0 ring-1 ring-white/10 sm:size-12" />
            <h2 className="text-3xl font-semibold tracking-tighter sm:text-5xl">{provider.name}</h2>
          </div>
          <p className="max-w-sm text-sm text-text-dim">{provider.tagline}</p>
        </div>
      </Reveal>
      <Row title="Films" items={movies.results} forceType="movie" />
      <Row title="Series" items={tv.results} forceType="tv" />
    </section>
  );
}
