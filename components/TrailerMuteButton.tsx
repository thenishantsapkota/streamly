"use client";

import { useCallback, useRef, useState } from "react";

export function TrailerMuteButton({ trailerKey }: { trailerKey: string }) {
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Find the trailer iframe in the DOM
  const getIframe = useCallback(() => {
    if (iframeRef.current) return iframeRef.current;
    const iframe = document.querySelector<HTMLIFrameElement>(
      `iframe[src*="${trailerKey}"]`,
    );
    if (iframe) iframeRef.current = iframe;
    return iframe;
  }, [trailerKey]);

  function toggle() {
    const iframe = getIframe();
    if (!iframe?.contentWindow) return;
    const next = !muted;
    // YouTube IFrame API postMessage command
    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: next ? "mute" : "unMute",
        args: [],
      }),
      "*",
    );
    setMuted(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Unmute trailer" : "Mute trailer"}
      className="rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70"
    >
      {muted ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
          <path d="M11 5 6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" />
          <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
          <path d="M11 5 6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
