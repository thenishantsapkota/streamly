"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";

const YT_ORIGIN = "https://www.youtube-nocookie.com";

/**
 * Billboard background: the backdrop still, with the muted YouTube trailer
 * fading in over it once it is actually playing.
 *
 * YouTube ignores most "hide the UI" params now, so the player is oversized
 * and cropped by its container: the title bar, logo and bottom chrome fall
 * outside the frame. The video is also hidden while buffering, paused, and in
 * the last second before it loops, so the spinner and end-screen never show.
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
  const [nearEnd, setNearEnd] = useState(false);

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
      if (typeof info.playerState === "number") setPlaying(info.playerState === 1);
      if (typeof info.currentTime === "number" && typeof info.duration === "number" && info.duration > 0) {
        setNearEnd(info.duration - info.currentTime < 1.2);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [trailerKey]);

  // Subscribe to player events (the YouTube iframe API handshake).
  function onLoad() {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: trailerKey }), YT_ORIGIN);
  }

  const showVideo = playing && !nearEnd;

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
      {trailerKey && (
        <iframe
          ref={iframeRef}
          onLoad={onLoad}
          src={`${YT_ORIGIN}/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&fs=0&cc_load_policy=0&enablejsapi=1`}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[max(56.25cqw,100cqh)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 scale-[1.32] border-0 transition-opacity duration-1000 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
