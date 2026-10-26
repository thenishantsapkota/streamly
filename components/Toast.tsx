"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckIcon, InfoIcon } from "@phosphor-icons/react";
import { EASE_CINEMA } from "./motion";

type ToastItem = { id: number; message: string; type: "success" | "info" };

const DURATION_MS = 2500;

let toastId = 0;
const listeners = new Set<(t: ToastItem) => void>();

export function toast(message: string, type: "success" | "info" = "success") {
  const item: ToastItem = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(item));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const reduce = useReducedMotion();

  const add = useCallback((t: ToastItem) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, DURATION_MS);
  }, []);

  useEffect(() => {
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, [add]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-24 left-1/2 z-9998 flex w-[min(92vw,380px)] -translate-x-1/2 flex-col items-stretch gap-2 sm:bottom-28"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout={!reduce}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, transition: { duration: 0.25 } }}
            transition={{ duration: 0.45, ease: EASE_CINEMA }}
            className="relative flex items-center gap-3 overflow-hidden bg-surface/95 py-3 pl-4 pr-5 text-sm font-medium shadow-[0_24px_48px_-12px_rgb(0_0_0/0.8)] ring-1 ring-inset ring-border backdrop-blur-xl"
          >
            <span
              className={`grid size-6 shrink-0 place-items-center ${
                t.type === "success" ? "bg-brand text-on-brand" : "bg-surface-2 text-text-dim"
              }`}
            >
              {t.type === "success" ? (
                <CheckIcon className="size-3.5" weight="bold" aria-hidden />
              ) : (
                <InfoIcon className="size-3.5" weight="bold" aria-hidden />
              )}
            </span>
            <span className="min-w-0 flex-1">{t.message}</span>
            {/* Time remaining */}
            <motion.span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px origin-left bg-brand/70"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: DURATION_MS / 1000, ease: "linear" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
