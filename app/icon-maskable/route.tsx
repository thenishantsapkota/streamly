import { ImageResponse } from "next/og";
import { MARK_ACCENT, MARK_BARS, MARK_LIGHT, MARK_PLAY } from "@/lib/brand-mark";

export const runtime = "edge";

/**
 * Maskable icon for Android adaptive icons. The OS masks this with a circle,
 * squircle, etc. — so the background must fill the entire square (no rounded
 * corners) and the foreground content must sit inside the inner ~80% safe
 * zone.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="280" height="280" viewBox="0 0 64 64">
          <path d={MARK_BARS} fill={MARK_LIGHT} fillRule="evenodd" />
          <path d={MARK_PLAY} fill={MARK_ACCENT} stroke={MARK_ACCENT} strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
      </div>
    ),
    {
      width: 512,
      height: 512,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
