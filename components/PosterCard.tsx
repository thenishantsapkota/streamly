import Image from "@/components/Image";
import { Link } from "@/lib/router-compat";
import { ArrowRightIcon, StarIcon } from "@phosphor-icons/react/dist/ssr";
import { TiltCard } from "./motion";
import { BLUR_DATA_URL } from "@/lib/image";

type Props = {
  href: string;
  title: string;
  poster: string | null;
  /** Small metadata pieces shown under the title, e.g. year and kind. */
  meta: string[];
  rating?: number | null;
  overview?: string;
  fluid?: boolean;
  priority?: boolean;
};

/**
 * Shared poster card. Hover: the card tilts toward the cursor, the art zooms
 * and dims, an amber frame draws in from the corners and a details panel
 * slides up from the bottom edge.
 */
export function PosterCard({ href, title, poster, meta, rating, overview, fluid, priority }: Props) {
  return (
    <Link
      href={href}
      className={`group relative block ${fluid ? "w-full" : "w-36 sm:w-48 shrink-0"}`}
    >
      <TiltCard className="aspect-2/3">
        <div className="relative h-full w-full overflow-hidden bg-surface-2 shadow-[0_0_0_1px_var(--color-border)] transition-shadow duration-500 group-hover:shadow-[0_24px_48px_-12px_rgb(0_0_0/0.8)]">
          {poster ? (
            <Image
              src={poster}
              alt={title}
              width={342}
              height={513}
              priority={priority}
              sizes="(max-width: 640px) 144px, 192px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="h-full w-full object-cover transition duration-700 ease-cinema group-hover:scale-110 group-hover:brightness-[0.45]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-text-dim">
              {title}
            </div>
          )}

          {/* Amber frame: four edges scale in from opposite corners. */}
          <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-500 ease-cinema group-hover:scale-x-100" />
          <span aria-hidden className="pointer-events-none absolute right-0 top-0 h-full w-px origin-top scale-y-0 bg-brand transition-transform delay-75 duration-500 ease-cinema group-hover:scale-y-100" />
          <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-px w-full origin-right scale-x-0 bg-brand transition-transform delay-150 duration-500 ease-cinema group-hover:scale-x-100" />
          <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-full w-px origin-bottom scale-y-0 bg-brand transition-transform delay-200 duration-500 ease-cinema group-hover:scale-y-100" />

          {/* Details panel */}
          <div className="absolute inset-x-0 bottom-0 translate-y-6 p-3 opacity-0 transition duration-500 ease-cinema group-hover:translate-y-0 group-hover:opacity-100 [transform:translateZ(40px)]">
            {rating ? (
              <div className="flex items-center gap-1 tabular-nums text-xs text-brand">
                <StarIcon className="size-3" weight="fill" aria-hidden />
                {rating.toFixed(1)}
              </div>
            ) : null}
            <div className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">{title}</div>
            {overview && (
              <p className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-white/70">{overview}</p>
            )}
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand">
              Details
              <ArrowRightIcon className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" aria-hidden />
            </div>
          </div>
        </div>
      </TiltCard>
      <div className="mt-2.5">
        <div className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-brand">{title}</div>
        <div className="mt-0.5 tabular-nums text-[11px] uppercase text-text-dim">
          {meta.filter(Boolean).join(" / ")}
        </div>
      </div>
    </Link>
  );
}
