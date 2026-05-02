import { ImageResponse } from "next/og";

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
          background: "linear-gradient(135deg, #1a1a22 0%, #0a0a0c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="280" height="280" viewBox="0 0 64 64">
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
    ),
    {
      width: 512,
      height: 512,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
