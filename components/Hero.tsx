
import Image from "@/components/Image";
import { Link } from "@/lib/router-compat";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CaretLeftIcon, CaretRightIcon, PlayIcon, StarIcon } from "@phosphor-icons/react";
import { backdropUrl, getTitle, getYear, type MediaItem, type MediaType } from "@/lib/tmdb";
import { BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";
import { EASE_CINEMA } from "./motion";

const AUTOPLAY_MS = 7000;
const TAB_COUNT = 5;

/**
 * Editorial billboard: text column on the left, framed backdrop on the right,
 * a blurred copy of the art filling the page behind both. Slides change with
 * a clip-path wipe and the title rises word by word.
 */
export function Hero({ items, label = "Trending now" }: { items: MediaItem[]; label?: string }) {
  const slides = items.filter((i) => i.backdrop_path).slice(0, TAB_COUNT);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const goTo = useCallback(
    (i: number) => {
      if (slides.length === 0) return;
      setIndex(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [paused, index, slides.length, goTo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") goTo(index - 1);
      else if (e.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  if (slides.length === 0) return null;

  const item = slides[index];
  const type: MediaType = item.media_type === "tv" ? "tv" : "movie";
  const title = getTitle(item);
  const href = `/${type}/${item.id}`;
  const bg = backdropUrl(item.backdrop_path, "original");
  const words = title.split(" ");

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 50) goTo(dx < 0 ? index + 1 : index - 1);
      }}
      aria-roledescription="carousel"
    >
      {/* Ambient layer: blurred art behind everything */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`amb-${item.id}`}
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {bg && (
            <Image src={bg} alt="" fill sizes="50vw" className="scale-125 object-cover opacity-35 blur-3xl" />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-bg/40 via-bg/70 to-bg" />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-24 sm:px-6 lg:min-h-[92dvh] lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-20 lg:pt-28">
        {/* Art */}
        <motion.div style={reduce ? undefined : { y: artY }} className="relative lg:order-2 lg:col-span-7">
          <div className="relative aspect-video w-full overflow-hidden bg-surface shadow-[0_40px_80px_-20px_rgb(0_0_0/0.9)]">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={item.id}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)" }}
                animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0 0%)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0.6 }}
                transition={{ duration: 1.1, ease: EASE_CINEMA }}
              >
                {bg && (
                  <motion.div
                    className="absolute inset-0"
                    initial={reduce ? false : { scale: 1.15 }}
                    animate={{ scale: 1.02 }}
                    transition={{ duration: AUTOPLAY_MS / 1000 + 1.5, ease: "linear" }}
                  >
                    <Image
                      src={bg}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority={index === 0}
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL_LANDSCAPE}
                      className="object-cover"
                    />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>

          {slides.length > 1 && (
            <div className="absolute -bottom-5 right-4 sm:right-6">
              <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => goTo(index - 1)}
                className="rounded-btn grid size-10 place-items-center bg-bg/80 text-white ring-1 ring-border backdrop-blur transition hover:bg-brand hover:text-on-brand hover:ring-brand active:scale-95"
              >
                <CaretLeftIcon className="size-4" weight="bold" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => goTo(index + 1)}
                className="rounded-btn grid size-10 place-items-center bg-bg/80 text-white ring-1 ring-border backdrop-blur transition hover:bg-brand hover:text-on-brand hover:ring-brand active:scale-95"
              >
                <CaretRightIcon className="size-4" weight="bold" aria-hidden />
              </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Copy */}
        <motion.div style={reduce ? undefined : { y: textY, opacity: fade }} className="lg:order-1 lg:col-span-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={item.id}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: EASE_CINEMA }}
            >
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_CINEMA }}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums text-xs uppercase text-text-dim"
              >
                <span className="text-brand">{label}</span>
                <span>{type === "movie" ? "Film" : "Series"}</span>
                <span>{getYear(item)}</span>
                {item.vote_average > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <StarIcon className="size-3" weight="fill" aria-hidden />
                    {item.vote_average.toFixed(1)}
                  </span>
                )}
              </motion.div>

              <h1 aria-label={title} className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tighter sm:text-5xl xl:text-6xl">
                {words.map((w, i) => (
                  <span key={`${w}-${i}`} aria-hidden className="-mb-[0.24em] inline-block overflow-hidden pb-[0.24em] align-bottom">
                    <motion.span
                      className="inline-block"
                      initial={reduce ? false : { y: "110%", rotate: 4 }}
                      animate={{ y: "0%", rotate: 0 }}
                      transition={{ duration: 0.9, delay: 0.08 + i * 0.07, ease: EASE_CINEMA }}
                    >
                      {w}
                      {i < words.length - 1 ? " " : ""}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE_CINEMA }}
                className="mt-5 max-w-md text-sm leading-relaxed text-white/75 line-clamp-3 sm:text-base"
              >
                {item.overview}
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.42, ease: EASE_CINEMA }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  href={href}
                  className="rounded-btn group inline-flex items-center gap-2.5 bg-brand px-7 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
                >
                  <PlayIcon className="size-4 transition-transform duration-300 group-hover:scale-110" weight="fill" aria-hidden />
                  Watch now
                </Link>
                <Link
                  href={href}
                  className="rounded-btn inline-flex items-center px-6 py-3 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-bg active:scale-[0.98]"
                >
                  Details
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

    </section>
  );
}
