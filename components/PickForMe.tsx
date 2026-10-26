
import Image from "@/components/Image";
import { Link } from "@/lib/router-compat";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowsClockwiseIcon, PlayIcon, ShuffleIcon, StarIcon } from "@phosphor-icons/react";
import { getTitle, getYear, posterUrl, type MediaItem } from "@/lib/tmdb";
import { BLUR_DATA_URL } from "@/lib/image";
import { EASE_CINEMA, Reveal } from "./motion";

type Phase = "idle" | "spinning" | "done";

/**
 * "Can't decide?" section: a drifting wall of posters behind a single card
 * that shuffles like a slot reel, decelerates, and lands on a random pick.
 */
export function PickForMe({ items }: { items: MediaItem[] }) {
  const pool = useMemo(() => {
    const seen = new Set<number>();
    return items.filter((i) => {
      if (!i.poster_path || seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });
  }, [items]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [shown, setShown] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (pool.length < 4) return null;

  function spin() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const target = Math.floor(Math.random() * pool.length);
    if (reduce) {
      setShown(target);
      setPhase("done");
      return;
    }
    setPhase("spinning");
    // Ease-out reel: short gaps first, growing longer until it lands.
    const steps = 22;
    let t = 0;
    for (let s = 1; s <= steps; s++) {
      t += 45 + Math.pow(s / steps, 3) * 380;
      const idx = s === steps ? target : Math.floor(Math.random() * pool.length);
      timers.current.push(setTimeout(() => setShown(idx), t));
    }
    timers.current.push(setTimeout(() => setPhase("done"), t + 250));
  }

  const pick = pool[shown];
  const type = pick.media_type === "tv" ? "tv" : "movie";
  const wall = [pool.slice(0, 12), pool.slice(12, 24), pool.slice(24, 36), pool.slice(6, 18)].map((row) =>
    row.length >= 6 ? row : pool.slice(0, 12),
  );

  return (
    <section className="relative -mb-32 mt-28 overflow-hidden border-t border-border pt-20 pb-24 sm:pt-28">
      {/* Poster wall */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex -rotate-6 scale-[1.35] flex-col justify-center gap-4 opacity-55">
        {wall.map((row, r) => (
          <div key={r} className="flex overflow-hidden">
            <div
              className="marquee-track flex shrink-0 gap-4 pr-4"
              style={{ animationDuration: `${80 + r * 25}s`, animationDirection: r % 2 ? "reverse" : "normal" }}
            >
              {[...row, ...row].map((m, i) => (
                <div key={`${m.id}-${i}`} className="relative h-56 w-36 shrink-0 overflow-hidden bg-surface-2">
                  <Image src={posterUrl(m.poster_path, "w185")!} alt="" fill sizes="144px" className="object-cover saturate-[0.85]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_center,rgb(10_10_10/0.92)_25%,rgb(10_10_10/0.55)_65%,rgb(10_10_10/0.9)_100%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_58%,rgb(240_162_59/0.28),transparent_38%)] mix-blend-screen" />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-bg to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-t from-bg to-transparent" />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <Reveal>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-6xl">
            Can&apos;t decide what to <span className="text-brand italic">watch?</span>
          </h2>
          <p className="mt-4 text-base text-text-dim sm:text-lg">We&apos;ll pull something from this week&apos;s most-watched for you.</p>
        </Reveal>

        {/* Reel */}
        <motion.div
          className="group/deck relative mt-12"
          style={{ perspective: 1000 }}
          animate={phase === "idle" && !reduce ? { y: [0, -8, 0] } : { y: 0 }}
          transition={phase === "idle" ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
        >
          {[pool[1], pool[2]].map((m, i) => (
            <div
              key={m.id}
              aria-hidden
              className={`absolute inset-0 overflow-hidden bg-surface-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)] transition-transform duration-700 ease-cinema ${
                i === 0
                  ? "-rotate-8 -translate-x-6 group-hover/deck:-rotate-14 group-hover/deck:-translate-x-16"
                  : "rotate-8 translate-x-6 group-hover/deck:rotate-14 group-hover/deck:translate-x-16"
              } ${phase === "idle" ? "" : "opacity-0"}`}
            >
              <Image src={posterUrl(m.poster_path, "w342")!} alt="" fill sizes="224px" className="object-cover brightness-75" />
            </div>
          ))}
          <motion.div
            animate={phase === "spinning" ? { rotateZ: [0, -2, 2, -1, 0] } : { rotateZ: 0 }}
            transition={phase === "spinning" ? { duration: 0.4, repeat: Infinity } : { duration: 0.3 }}
            className="relative h-72 w-48 overflow-hidden bg-surface-2 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.95),0_0_0_1px_var(--color-border)] sm:h-84 sm:w-56"
          >
            {phase === "idle" ? (
              <div className="absolute inset-0">
                <Image
                  src={posterUrl(pool[0].poster_path, "w342")!}
                  alt=""
                  fill
                  sizes="224px"
                  className="scale-110 object-cover blur-md brightness-50"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <motion.span
                    className="text-8xl font-black leading-none text-brand"
                    animate={reduce ? undefined : { rotate: [0, -8, 8, 0], scale: [1, 1.06, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.8 }}
                  >
                    ?
                  </motion.span>
                  <span className="text-sm text-white/80">Your pick lands here</span>
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={`${pick.id}-${shown}`}
                  className="absolute inset-0"
                  initial={{ y: "-100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "100%" }}
                  transition={{ duration: phase === "spinning" ? 0.09 : 0.5, ease: phase === "spinning" ? "linear" : EASE_CINEMA }}
                >
                  <Image
                    src={posterUrl(pick.poster_path, "w342")!}
                    alt={getTitle(pick)}
                    fill
                    sizes="224px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className={`object-cover transition duration-300 ${phase === "spinning" ? "blur-[1.5px] brightness-75" : ""}`}
                  />
                </motion.div>
              </AnimatePresence>
            )}
            {phase === "done" && !reduce && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-brand"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0.2, 1, 0] }}
                transition={{ duration: 1.2 }}
              />
            )}
          </motion.div>
        </motion.div>

        <div className="mt-12 min-h-28">
          <AnimatePresence mode="wait">
            {phase === "done" ? (
              <motion.div
                key={`res-${pick.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: EASE_CINEMA }}
                className="flex flex-col items-center"
              >
                <h3 className="text-2xl font-semibold tracking-tight">{getTitle(pick)}</h3>
                <div className="mt-1.5 flex items-center gap-3 text-sm tabular-nums text-text-dim">
                  <span>{getYear(pick)}</span>
                  <span>{type === "movie" ? "Film" : "Series"}</span>
                  {pick.vote_average > 0 && (
                    <span className="inline-flex items-center gap-1 text-brand">
                      <StarIcon className="size-3" weight="fill" aria-hidden />
                      {pick.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/${type}/${pick.id}`}
                    className="group inline-flex items-center gap-2.5 bg-brand px-7 py-3.5 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
                  >
                    <PlayIcon className="size-4 transition-transform duration-300 group-hover:scale-110" weight="fill" aria-hidden />
                    Watch now
                  </Link>
                  <button
                    type="button"
                    onClick={spin}
                    className="group inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 transition hover:bg-white hover:text-bg active:scale-[0.98]"
                  >
                    <ArrowsClockwiseIcon className="size-4 transition-transform duration-500 group-hover:rotate-180" weight="bold" aria-hidden />
                    Spin again
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="cta"
                type="button"
                onClick={spin}
                disabled={phase === "spinning"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden bg-brand px-12 py-4 text-base font-semibold text-on-brand shadow-[0_18px_40px_-12px_rgb(240_162_59/0.55)] transition-colors hover:bg-brand-hover disabled:opacity-70"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
                />
                <span className="relative inline-flex items-center gap-2">
                  <ShuffleIcon className="size-5" weight="bold" aria-hidden />
                  {phase === "spinning" ? "Picking..." : "Pick for me"}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
