
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ShieldWarningIcon, XIcon } from "@phosphor-icons/react";
import { EASE_CINEMA } from "./motion";

const STORAGE_KEY = "ad-blocker-hint-dismissed-v1";

export function AdBlockerHint() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore quota errors */
    }
    setShow(false);
  }

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.45, ease: EASE_CINEMA }}
          className="overflow-hidden"
        >
          <div className="mb-2 flex items-start gap-3 border-l-2 border-brand bg-surface px-3 py-2.5 text-xs ring-1 ring-inset ring-border sm:text-sm">
            <ShieldWarningIcon className="mt-0.5 size-4 shrink-0 text-brand sm:size-5" weight="bold" aria-hidden />
            <div className="min-w-0 flex-1 leading-relaxed text-text-dim">
              The player may open popup ads from third parties. An ad blocker like{" "}
              <a
                href="https://ublockorigin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text underline decoration-white/30 underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
              >
                uBlock Origin
              </a>{" "}
              gives the smoothest experience.
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={dismiss}
              className="-mr-1 -mt-0.5 grid size-7 shrink-0 place-items-center text-text-dim transition hover:bg-surface-2 hover:text-text active:scale-95"
            >
              <XIcon className="size-4" weight="bold" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
