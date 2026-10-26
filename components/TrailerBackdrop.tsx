
import Image from "@/components/Image";
import { useEffect, useRef, useState } from "react";
import { BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";

const YT_ORIGIN = "https://www.youtube-nocookie.com";
const REVEAL_AFTER_MS = 600;

/**
 * Billboard background: the backdrop still, with the muted YouTube trailer
 * fading in over it once it is actually playing.
 *
 * YouTube ignores most "hide the UI" params now, so the player is oversized
 * and cropped by its container: the title bar, logo and bottom chrome fall
 * outside the frame. The video is also hidden while buffering, paused, for its
 * first seconds (title overlay) and its last seconds (end-screen) before it loops.
 */
export function TrailerBackdrop({
  trailerKey,
  backdrop,
  title,
}: {
  trailerKey: string | null;
  backdrop: string | null;
  title: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [settled, setSettled] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);
  // The iframe is client-only: it mounts after hydration so it never races the page.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!trailerKey) return;
    function onMessage(e: MessageEvent) {
      if (e.origin !== YT_ORIGIN || e.source !== iframeRef.current?.contentWindow) return;
      let data: { event?: string; info?: { playerState?: number; currentTime?: number; duration?: number } };
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      const info = data?.info;
      if (!info) return;
      heardRef.current = true;
      if (typeof info.playerState === "number") setPlaying(info.playerState === 1);
      if (typeof info.currentTime === "number" && typeof info.duration === "number" && info.duration > 0) {
        setNearEnd(info.duration - info.currentTime < 2.5);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [trailerKey]);

  // Brief settle after playback starts so the first frames (and any title
  // flash, mostly cropped away by the 1.5x scale) are skipped.
  useEffect(() => {
    if (!playing) {
      setSettled(false);
      return;
    }
    const t = setTimeout(() => setSettled(true), REVEAL_AFTER_MS);
    return () => clearTimeout(t);
  }, [playing]);

  // Subscribe to player events (the YouTube iframe API handshake). The
  // player ignores "listening" until its own script has booted, so repeat it
  // every 250ms until the first event arrives, like the official API does.
  const heardRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!loaded || !trailerKey) return;
    const ping = () =>
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: trailerKey }), YT_ORIGIN);
    ping();
    const interval = setInterval(() => {
      if (heardRef.current) clearInterval(interval);
      else ping();
    }, 250);
    // A player that never answers (embedding disabled, region-blocked) never
    // reports "playing", so the still backdrop simply stays.
    const stop = setTimeout(() => clearInterval(interval), 15_000);
    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [loaded, trailerKey]);

  const showVideo = playing && settled && !nearEnd;

  return (
    <div className="absolute inset-0 overflow-hidden bg-bg [container-type:size]">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL_LANDSCAPE}
          className="object-cover"
        />
      )}
      {trailerKey && mounted && (
        <iframe
          ref={iframeRef}
          onLoad={() => setLoaded(true)}
          src={`${YT_ORIGIN}/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&fs=0&cc_load_policy=0&enablejsapi=1`}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[max(56.25cqw,100cqh)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 scale-[1.5] border-0 transition-opacity duration-700 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
