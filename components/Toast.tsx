"use client";

import { useEffect, useState, useCallback } from "react";

type ToastItem = { id: number; message: string; type: "success" | "info" };

let toastId = 0;
const listeners = new Set<(t: ToastItem) => void>();

export function toast(message: string, type: "success" | "info" = "success") {
  const item: ToastItem = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(item));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((t: ToastItem) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 2500);
  }, []);

  useEffect(() => {
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, [add]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9998 flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-enter rounded-full border border-border bg-surface/95 backdrop-blur-xl px-4 py-2 text-sm font-medium shadow-2xl flex items-center gap-2"
        >
          {t.type === "success" ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth={2.5}
              className="size-4"
            >
              <path
                d="M20 6 9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="size-4 text-text-dim"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v.01M12 8v4" strokeLinecap="round" />
            </svg>
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
