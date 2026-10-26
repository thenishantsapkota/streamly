import { Suspense } from "react";
import { useSuspenseQuery, type UseSuspenseQueryOptions } from "@tanstack/react-query";
import { Row } from "./Row";
import { AnimeRow } from "./AnimeRow";
import type { MediaItem, MediaType } from "@/lib/tmdb";
import type { Anime } from "@/lib/anilist";

type PageResult = { results: MediaItem[] };

/** Poster-row placeholder shaped like the real row (header hairline + cards). */
export function RowSkeleton() {
  return (
    <section className="mt-14" aria-hidden>
      <div className="mb-4 flex items-end gap-4 px-4 sm:px-6">
        <div className="h-7 w-44 shimmer" />
        <span className="mb-2 h-px flex-1 bg-border" />
      </div>
      <div className="flex gap-4 overflow-hidden px-4 pt-2 pb-4 sm:gap-5 sm:px-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-36 shrink-0 sm:w-48">
            <div className="aspect-2/3 shimmer" />
            <div className="mt-2.5 h-3.5 w-3/4 shimmer" />
            <div className="mt-1.5 h-2.5 w-1/3 shimmer" />
          </div>
        ))}
      </div>
    </section>
  );
}

function MediaRowInner({
  title,
  query,
  forceType,
  href,
}: {
  title: string;
  query: UseSuspenseQueryOptions<PageResult, Error, PageResult, readonly unknown[]>;
  forceType?: MediaType;
  href?: string;
}) {
  const { data } = useSuspenseQuery(query);
  return <Row title={title} items={data.results} forceType={forceType} viewAllHref={href} />;
}

/** A TMDB poster row fed by a React Query entry; suspends behind its own skeleton. */
export function QueryRow(props: Parameters<typeof MediaRowInner>[0]) {
  return (
    <Suspense fallback={<RowSkeleton />}>
      <MediaRowInner {...props} />
    </Suspense>
  );
}

function AnimeRowInner({
  title,
  query,
  href,
}: {
  title: string;
  query: UseSuspenseQueryOptions<Anime[], Error, Anime[], readonly unknown[]>;
  href?: string;
}) {
  const { data } = useSuspenseQuery(query);
  return <AnimeRow title={title} items={data} viewAllHref={href} />;
}

/** AniList variant of QueryRow. */
export function AnimeQueryRow(props: Parameters<typeof AnimeRowInner>[0]) {
  return (
    <Suspense fallback={<RowSkeleton />}>
      <AnimeRowInner {...props} />
    </Suspense>
  );
}
