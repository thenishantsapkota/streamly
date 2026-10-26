
import Image from "@/components/Image";
import { Link } from "@/lib/router-compat";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon, StarIcon } from "@phosphor-icons/react";
import { RowHeader } from "./RowHeader";
import { EASE_CINEMA, Reveal } from "./motion";
import { backdropUrl, getTitle, getYear, posterUrl, type MediaItem, type MediaType } from "@/lib/tmdb";
import { BLUR_DATA_URL, BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";

type Props = {
  title: string;
  items: MediaItem[];
  forceType?: MediaType;
};

/**
 * Ranked chart: a featured preview on the left, the 1-10 list on the right.
 * Hovering (or focusing) a row swaps the preview with a wipe.
 */
export function Top10Row({ title, items, forceType }: Props) {
  const top10 = items.slice(0, 10);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  if (!top10.length) return null;

  const typeOf = (item: MediaItem): MediaType => forceType ?? (item.media_type === "tv" ? "tv" : "movie");
  const featured = top10[active];
  const featuredType = typeOf(featured);
  const featuredBg = backdropUrl(featured.backdrop_path, "w1280");

  return (
    <section className="mt-14">
      <RowHeader title={title} href="/trending" />
      <div className="grid gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
        {/* Featured preview */}
        <Reveal className="hidden lg:col-span-7 lg:block">
          <Link href={`/${featuredType}/${featured.id}`} className="group relative block h-full min-h-96 overflow-hidden bg-surface">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={featured.id}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
                animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)" }}
                exit={{ opacity: 0.5 }}
                transition={{ duration: 0.7, ease: EASE_CINEMA }}
              >
                {featuredBg && (
                  <Image
                    src={featuredBg}
                    alt=""
                    fill
                    sizes="60vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL_LANDSCAPE}
                    className="object-cover transition-transform duration-[1.5s] ease-cinema group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/50 to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-x-0 bottom-0 p-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={featured.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: EASE_CINEMA }}
                >
                  <div className="numeral-outline font-display text-[8rem] font-extrabold leading-[0.9] tracking-tighter">{active + 1}</div>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight">{getTitle(featured)}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 line-clamp-2">{featured.overview}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand">
                    View details
                    <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" weight="bold" aria-hidden />
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </Link>
        </Reveal>

        {/* Ranked list */}
        <ol className="overflow-x-clip lg:col-span-5">
          {top10.map((item, i) => {
            const type = typeOf(item);
            const isActive = i === active;
            const poster = posterUrl(item.poster_path, "w185");
            return (
              <motion.li
                key={`${item.id}-${type}`}
                initial={reduce ? false : { opacity: 0, x: 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ duration: 0.55, delay: i * 0.04, ease: EASE_CINEMA }}
              >
                <Link
                  href={`/${type}/${item.id}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group relative flex items-center gap-4 border-b border-border py-2.5 pr-2"
                >
                  {/* Amber rail that grows in on the active row */}
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 w-0.5 origin-top bg-brand transition-transform duration-500 ease-cinema ${
                      isActive ? "scale-y-100" : "scale-y-0"
                    }`}
                  />
                  <span
                    className={`w-14 shrink-0 pl-3 font-display text-4xl font-bold leading-none tracking-tighter transition-colors duration-300 ${
                      isActive ? "text-brand" : "text-white/15 group-hover:text-white/45"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden bg-surface-2">
                    {poster && (
                      <Image
                        src={poster}
                        alt=""
                        fill
                        sizes="44px"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        className={`object-cover transition duration-500 ${isActive ? "scale-110" : "grayscale-[60%]"}`}
                      />
                    )}
                  </div>
                  <div
                    className={`min-w-0 flex-1 transition-transform duration-500 ease-cinema ${
                      isActive ? "translate-x-1" : ""
                    }`}
                  >
                    <div className={`line-clamp-1 text-sm font-medium transition-colors ${isActive ? "text-white" : "text-white/80"}`}>
                      {getTitle(item)}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 tabular-nums text-[11px] uppercase text-text-dim">
                      <span>{getYear(item)}</span>
                      <span>{type === "movie" ? "Film" : "Series"}</span>
                      {item.vote_average > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <StarIcon className="size-2.5" weight="fill" aria-hidden />
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRightIcon
                    className={`size-4 shrink-0 transition duration-300 ${
                      isActive ? "translate-x-0 text-brand opacity-100" : "-translate-x-2 opacity-0"
                    }`}
                    weight="bold"
                    aria-hidden
                  />
                </Link>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
