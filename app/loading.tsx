/** Skeleton shaped like the editorial billboard plus poster rows. */
export default function Loading() {
  return (
    <div className="-mt-16" aria-busy="true" aria-label="Loading">
      {/* Billboard */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-24 sm:px-6 lg:min-h-[92dvh] lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-20 lg:pt-28">
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
            <div className="shimmer h-11 w-36" />
            <div className="shimmer h-11 w-24" />
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="mx-auto max-w-7xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mt-14">
            <div className="mb-4 flex items-end gap-4 px-4 sm:px-6">
              <div className="shimmer h-6 w-44" />
              <span className="mb-2 h-px flex-1 bg-border" />
            </div>
            <div className="flex gap-4 overflow-hidden px-4 pt-2 sm:gap-5 sm:px-6">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="w-36 shrink-0 sm:w-48">
                  <div className="shimmer aspect-2/3" />
                  <div className="shimmer mt-2.5 h-4 w-3/4" />
                  <div className="shimmer mt-1.5 h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
