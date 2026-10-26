import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_CINEMA } from "./motion";
import { MARK_ACCENT, MARK_BARS, MARK_LIGHT, MARK_PLAY, MARK_VIEWBOX } from "@/lib/brand-mark";

const SEEN_KEY = "splash-seen-v3";
let shouldPlay: boolean | null = null;

type Phase = "count" | "brand" | "out" | "done";

/** Timeline (ms): film-leader countdown, flash cut to the brand, letterbox reveal. */
const COUNT_STEP = 380;
const BRAND_AT = COUNT_STEP * 3;
const OUT_AT = BRAND_AT + 1500;
const DONE_AT = OUT_AT + 900;

/**
 * Opening title sequence, once per session:
 * 1. Film-leader countdown (3, 2, 1) over crosshairs with an amber radar sweep.
 * 2. Flash cut: the film-strip bars slam in, the play triangle springs in,
 *    STREAMLY snaps together as its tracking collapses, under a projector glow.
 * 3. The letterbox splits open while the title pushes toward the camera.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("count");
  const [count, setCount] = useState(3);
  const reduce = useReducedMotion();

  useEffect(() => {
    // Decide once per page load; dev-mode effect double-runs must not see
    // the flag this same load just wrote.
    if (shouldPlay === null) {
      try {
        shouldPlay = window.sessionStorage.getItem(SEEN_KEY) !== "1";
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        shouldPlay = true;
      }
    }
    if (!shouldPlay || reduce) {
      setPhase("done");
      return;
    }
    const timers = [
      setTimeout(() => setCount(2), COUNT_STEP),
      setTimeout(() => setCount(1), COUNT_STEP * 2),
      setTimeout(() => setPhase("brand"), BRAND_AT),
      setTimeout(() => setPhase("out"), OUT_AT),
      setTimeout(() => setPhase("done"), DONE_AT),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  if (phase === "done") return null;

  const opening = phase === "out";
  const letters = "STREAMLY".split("");

  return (
    <div className="pointer-events-none fixed inset-0 z-9999 overflow-hidden" aria-hidden>
      {/* Letterbox halves: the curtain that opens at the end */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-bg"
        animate={opening ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.85, ease: EASE_CINEMA }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-bg"
        animate={opening ? { y: "100%" } : { y: 0 }}
        transition={{ duration: 0.85, ease: EASE_CINEMA }}
      />

      {/* Projector flicker over everything until the reveal */}
      <motion.div
        className="absolute inset-0"
        animate={opening ? { opacity: 0 } : { opacity: [1, 0.86, 1, 0.93, 1, 0.9, 1] }}
        transition={opening ? { duration: 0.3 } : { duration: 0.5, repeat: Infinity }}
      >
        <AnimatePresence mode="wait">
          {phase === "count" ? (
            <motion.div
              key="leader"
              className="absolute inset-0 grid place-items-center"
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.15 }}
            >
              {/* Crosshairs */}
              <span className="absolute inset-x-0 top-1/2 h-px bg-white/12" />
              <span className="absolute inset-y-0 left-1/2 w-px bg-white/12" />
              {/* Rings with the radar sweep */}
              <div className="relative grid size-64 place-items-center sm:size-80">
                <span className="absolute inset-0 rounded-full border border-white/15" />
                <span className="absolute inset-6 rounded-full border border-white/10" />
                <motion.span
                  className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgb(240_162_59/0.45),rgb(240_162_59/0.08)_22%,transparent_30%)]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: COUNT_STEP / 1000, ease: "linear", repeat: Infinity }}
                />
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={count}
                    className="relative font-display text-[9rem] font-extrabold leading-none text-white sm:text-[11rem]"
                    initial={{ opacity: 0, scale: 1.5, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.22, ease: EASE_CINEMA }}
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="brand"
              className="absolute inset-0 grid place-items-center"
              animate={opening ? { scale: 1.35, opacity: 0, filter: "blur(6px)" } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: EASE_CINEMA }}
            >
              {/* Projector glow */}
              <motion.span
                className="absolute size-[70vmax] rounded-full bg-[radial-gradient(closest-side,rgb(240_162_59/0.22),transparent)]"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: EASE_CINEMA }}
              />

              <div className="relative flex flex-col items-center">
                <svg viewBox={MARK_VIEWBOX} width={112} height={112} className="overflow-visible">
                  <clipPath id="splash-top">
                    <rect x="0" y="0" width="64" height="31" />
                  </clipPath>
                  <clipPath id="splash-bottom">
                    <rect x="0" y="33" width="64" height="31" />
                  </clipPath>
                  <motion.path
                    d={MARK_BARS}
                    fill={MARK_LIGHT}
                    fillRule="evenodd"
                    clipPath="url(#splash-top)"
                    initial={{ x: 90, skewX: -25, opacity: 0 }}
                    animate={{ x: 0, skewX: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  />
                  <motion.path
                    d={MARK_BARS}
                    fill={MARK_LIGHT}
                    fillRule="evenodd"
                    clipPath="url(#splash-bottom)"
                    initial={{ x: -90, skewX: -25, opacity: 0 }}
                    animate={{ x: 0, skewX: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26, delay: 0.06 }}
                  />
                  <motion.path
                    d={MARK_PLAY}
                    fill={MARK_ACCENT}
                    stroke={MARK_ACCENT}
                    strokeWidth={1.6}
                    strokeLinejoin="round"
                    style={{ transformOrigin: "30px 32px" }}
                    initial={{ scale: 0, rotate: -120 }}
                    animate={{ scale: [0, 1.35, 1], rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.22, ease: EASE_CINEMA }}
                  />
                </svg>

                <motion.div
                  className="mt-7 flex font-display text-4xl font-bold sm:text-6xl"
                  initial={{ letterSpacing: "0.9em", opacity: 0 }}
                  animate={{ letterSpacing: "0.2em", opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.3, ease: EASE_CINEMA }}
                >
                  {letters.map((l, i) => (
                    <motion.span
                      key={i}
                      className={i < 6 ? "text-white" : "text-brand"}
                      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.5, delay: 0.32 + i * 0.035, ease: EASE_CINEMA }}
                    >
                      {l}
                    </motion.span>
                  ))}
                </motion.div>

                <motion.span
                  className="mt-5 h-px w-48 origin-center bg-brand"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.7, ease: EASE_CINEMA }}
                />
              </div>

              {/* Flash cut */}
              <motion.span
                className="absolute inset-0 bg-[#fff6e8]"
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
