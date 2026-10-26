import { ImageResponse } from "next/og";
import { MARK_ACCENT, MARK_BARS, MARK_LIGHT, MARK_PLAY } from "@/lib/brand-mark";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 40,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path d={MARK_BARS} fill={MARK_LIGHT} fillRule="evenodd" />
          <path d={MARK_PLAY} fill={MARK_ACCENT} stroke={MARK_ACCENT} strokeWidth={1.6} strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
