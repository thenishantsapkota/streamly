import Image from "next/image";
import { backdropUrl, posterUrl, type Genre } from "@/lib/tmdb";
import { BLUR_DATA_URL, BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";
import { ParallaxBackdrop, Reveal, SplitTitle, TiltCard } from "./motion";

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
    <section className="relative -mt-16 isolate overflow-hidden">
      {bg && (
        <ParallaxBackdrop className="absolute inset-0 -z-10">
          <Image
            src={bg}
            alt=""
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL_LANDSCAPE}
            className="object-cover opacity-50"
          />
        </ParallaxBackdrop>
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/70 via-40% to-bg/20" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-bg/90 via-bg/40 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-end gap-5 px-4 pb-10 pt-28 sm:gap-8 sm:px-6 sm:pb-14 sm:pt-36">
        <Reveal className="w-24 shrink-0 sm:w-44">
          <TiltCard className="aspect-2/3">
            <div className="relative h-full w-full overflow-hidden bg-surface-2 shadow-[0_0_0_1px_var(--color-border),0_24px_48px_-12px_rgb(0_0_0/0.85)]">
              {poster && (
                <Image
                  src={poster}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 96px, 176px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              )}
            </div>
          </TiltCard>
        </Reveal>
        <div className="min-w-0 flex-1">
          {meta.length > 0 && (
            <Reveal y={12} className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums text-xs uppercase text-text-dim">
              {meta.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </Reveal>
          )}
          <SplitTitle
            text={title}
            delay={0.1}
            className="mt-2 text-3xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl"
          />
          {tagline && (
            <Reveal delay={0.3} y={12}>
              <p className="mt-2 text-sm text-white/70 sm:text-base">{tagline}</p>
            </Reveal>
          )}
        </div>
      </div>

      <Reveal className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <span key={g.id} className="border border-border px-3 py-1.5 text-xs text-text-dim">
                {g.name}
              </span>
            ))}
          </div>
        )}
        <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-white/80">{overview}</p>
      </Reveal>
    </section>
  );
}
