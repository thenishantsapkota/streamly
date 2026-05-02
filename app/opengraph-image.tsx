import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Streamly — Watch movies, TV & anime";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #0a0a0c 0%, #1c1c24 100%)",
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
              background: "linear-gradient(135deg, #1a1a22 0%, #0a0a0c 100%)",
              border: "1px solid #2a2a35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="64" height="64" viewBox="0 0 64 64">
              <path
                d="M16 18 L30 32 L16 46"
                stroke="#e50914"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M32 18 L46 32 L32 46"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 800, letterSpacing: -2 }}>
            <span style={{ color: "#e50914" }}>Stream</span>
            <span>ly</span>
          </div>
        </div>
        <div style={{ marginTop: 36, fontSize: 44, fontWeight: 700, lineHeight: 1.15, maxWidth: 920 }}>
          Watch movies, TV shows & anime — all in one place.
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: "#9ca3af" }}>
          Powered by TMDB · AniList
        </div>
      </div>
    ),
    size,
  );
}
