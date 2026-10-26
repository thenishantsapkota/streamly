import { RowSkeleton } from "./QueryRow";

/** Billboard-shaped placeholder (split layout: copy left, art right). */
export function HeroSkeleton() {
  return (
    <div
      aria-hidden
      className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-24 sm:px-6 lg:min-h-[92dvh] lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-20 lg:pt-28"
    >
      <div className="shimmer aspect-video w-full lg:order-2 lg:col-span-7" />
      <div className="lg:order-1 lg:col-span-5">
        <div className="shimmer h-3 w-40" />
        <div className="shimmer mt-5 h-10 w-11/12 sm:h-14" />
        <div className="shimmer mt-3 h-10 w-2/3 sm:h-14" />
        <div className="mt-6 space-y-2">
          <div className="shimmer h-3.5 w-full max-w-md" />
          <div className="shimmer h-3.5 w-5/6 max-w-md" />
          <div className="shimmer h-3.5 w-2/3 max-w-md" />
        </div>
        <div className="mt-8 flex gap-3">
          <div className="shimmer h-11 w-36 rounded-btn" />
          <div className="shimmer h-11 w-24 rounded-btn" />
        </div>
      </div>
    </div>
  );
}

/** Top 10 chart placeholder: preview panel plus ranked rows. */
export function Top10Skeleton() {
  return (
    <section className="mt-14" aria-hidden>
      <div className="mb-4 flex items-end gap-4 px-4 sm:px-6">
        <div className="shimmer h-7 w-40" />
        <span className="mb-2 h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
        <div className="shimmer hidden min-h-96 lg:col-span-7 lg:block" />
        <div className="lg:col-span-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border py-2.5">
              <div className="w-14 pl-3 font-display text-4xl font-bold leading-none text-white/10">{i + 1}</div>
              <div className="shimmer h-16 w-11" />
              <div className="flex-1 space-y-1.5">
                <div className="shimmer h-3.5 w-2/3" />
                <div className="shimmer h-2.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Generic route placeholder: billboard plus poster rows. */
export function PageSkeleton() {
  return (
    <div className="-mt-16" aria-busy="true" aria-label="Loading">
      <HeroSkeleton />
      <div className="mx-auto max-w-7xl">
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </div>
  );
}
