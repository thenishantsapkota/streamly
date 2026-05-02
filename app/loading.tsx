export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
      {/* Hero skeleton */}
      <div className="shimmer -mx-4 sm:-mx-6 -mt-24 aspect-[21/9] w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] rounded-none" />

      {/* Row skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mt-10">
          <div className="shimmer mb-3 h-6 w-40 rounded" />
          <div className="flex gap-3 sm:gap-4 overflow-hidden">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="shrink-0 w-34 sm:w-45">
                <div className="shimmer aspect-2/3 rounded-lg" />
                <div className="shimmer mt-2 h-4 w-3/4 rounded" />
                <div className="shimmer mt-1 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
