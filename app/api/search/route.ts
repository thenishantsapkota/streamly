import { NextResponse } from "next/server";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 600;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });
  try {
    const data = await tmdbApi.search(q);
    const results = data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        media_type: r.media_type,
        title: r.title ?? r.name ?? "",
        poster_path: r.poster_path,
        vote_average: r.vote_average,
        year: (r.release_date || r.first_air_date || "").slice(0, 4),
      }));
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=600" } },
    );
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
