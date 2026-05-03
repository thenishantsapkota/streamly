"use client";

import { toast } from "./Toast";

type Props = {
  title: string;
  text?: string;
  className?: string;
};

export function ShareButton({ title, text, className = "" }: Props) {
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard");
    } catch {
      toast("Couldn't copy link", "info");
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Share"
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-surface hover:bg-surface-2 px-4 py-2 text-sm font-medium text-text-dim hover:text-white transition ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="16 6 12 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round" />
      </svg>
      Share
    </button>
  );
}
