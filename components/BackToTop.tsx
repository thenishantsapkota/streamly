"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { ArrowUpIcon } from "@phosphor-icons/react";
import { EASE_CINEMA } from "./motion";

/**
 * Square back-to-top button. Appears after the first screenful; an amber
 * bar along its bottom edge fills with page progress.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();

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
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: EASE_CINEMA }}
          className="group fixed bottom-24 right-4 z-40 grid size-11 place-items-center overflow-hidden bg-surface/90 text-text-dim shadow-[0_16px_32px_-8px_rgb(0_0_0/0.8)] ring-1 ring-inset ring-border backdrop-blur transition-colors hover:bg-white hover:text-bg active:scale-[0.96] sm:bottom-28 sm:right-6"
        >
          <ArrowUpIcon
            className="size-4 transition-transform duration-300 ease-cinema group-hover:-translate-y-0.5"
            weight="bold"
            aria-hidden
          />
          <motion.span
            aria-hidden
            style={{ scaleX: scrollYProgress }}
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
