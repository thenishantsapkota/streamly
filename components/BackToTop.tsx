
import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { ArrowUpIcon } from "@phosphor-icons/react";
import { EASE_CINEMA } from "./motion";

const R = 25;

/**
 * Back-to-top in the dock's material (floating chrome is the one place the
 * system uses circles): frosted disc, arrow, and a thin amber ring that
 * traces reading progress around the edge.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 26 });

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 600;
    setShow((prev) => (prev === next ? prev : next));
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, ease: EASE_CINEMA }}
          whileTap={{ scale: 0.92 }}
          className="group fixed bottom-24 right-4 z-40 grid size-14 place-items-center rounded-full border border-white/10 bg-surface/80 text-text-dim shadow-[0_20px_50px_-10px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl transition-colors hover:text-white sm:bottom-28 sm:right-6"
        >
          <svg viewBox="0 0 56 56" className="absolute inset-0 size-full -rotate-90" aria-hidden>
            <circle cx="28" cy="28" r={R} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="1.5" />
            <motion.circle
              cx="28"
              cy="28"
              r={R}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          </svg>
          <ArrowUpIcon
            className="relative size-[18px] transition-transform duration-300 ease-cinema group-hover:-translate-y-0.5"
            weight="bold"
            aria-hidden
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
