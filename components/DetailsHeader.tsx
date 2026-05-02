import { backdropUrl, posterUrl, type Genre } from "@/lib/tmdb";

type Props = {
  title: string;
  tagline?: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  meta: string[];
  genres?: Genre[];
};

export function DetailsHeader({ title, tagline, overview, posterPath, backdropPath, meta, genres }: Props) {
  const bg = backdropUrl(backdropPath, "original");
  const poster = posterUrl(posterPath, "w500");
  return (
    <section className="relative">
      {bg && (
        <div className="absolute inset-x-0 top-0 h-105 -z-10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bg} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-bg/70 to-bg" />
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-6 flex gap-6">
        <div className="hidden sm:block w-44 shrink-0">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt={title}
              className="aspect-2/3 w-full rounded-lg object-cover ring-1 ring-border"
            />
          ) : (
            <div className="aspect-2/3 w-full rounded-lg bg-surface-2" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{title}</h1>
          {tagline && <p className="mt-1 italic text-text-dim">{tagline}</p>}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-dim">
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-border">•</span>}
                <span>{m}</span>
              </span>
            ))}
          </div>
          {genres && genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}
          <p className="mt-4 max-w-3xl text-sm sm:text-base text-white/90">{overview}</p>
        </div>
      </div>
    </section>
  );
}
