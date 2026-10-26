
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SpeakerHighIcon, SpeakerXIcon } from "@phosphor-icons/react";

export function TrailerMuteButton({ trailerKey }: { trailerKey: string }) {
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const reduce = useReducedMotion();

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
      aria-pressed={!muted}
      className="relative inline-flex size-11 items-center justify-center rounded-btn bg-black/40 text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm transition duration-300 hover:bg-white hover:text-bg active:scale-[0.98]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={muted ? "muted" : "on"}
          className="inline-flex"
          initial={reduce ? false : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 26 }}
        >
          {muted ? (
            <SpeakerXIcon className="size-4" weight="bold" aria-hidden />
          ) : (
            <SpeakerHighIcon className="size-4" weight="bold" aria-hidden />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
