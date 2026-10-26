import { ImageResponse } from "next/og";
import { MARK_ACCENT, MARK_BARS, MARK_LIGHT, MARK_PLAY } from "@/lib/brand-mark";

export const runtime = "edge";
export const alt = "Streamly: Watch movies, TV & anime";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #0a0a0a 0%, #161616 100%)",
          color: "#f5f5f7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "#0a0a0a",
              border: "1px solid #2a2a35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="64" height="64" viewBox="0 0 64 64">
              <path d={MARK_BARS} fill={MARK_LIGHT} fillRule="evenodd" />
              <path d={MARK_PLAY} fill={MARK_ACCENT} stroke={MARK_ACCENT} strokeWidth={1.6} strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 800, letterSpacing: -2 }}>
            <span>STREAM</span>
            <span style={{ color: "#f0a23b" }}>LY</span>
          </div>
        </div>
        <div style={{ marginTop: 36, fontSize: 44, fontWeight: 700, lineHeight: 1.15, maxWidth: 920 }}>
          Watch movies, TV shows & anime in one place.
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: "#9ca3af" }}>
          Powered by TMDB · AniList
        </div>
      </div>
    ),
    size,
  );
}
