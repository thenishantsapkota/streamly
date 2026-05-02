import { NextResponse } from "next/server";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tv = url.searchParams.get("tv");
  const season = url.searchParams.get("season");
  if (!tv || !season) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  try {
    const data = await tmdbApi.season(tv, season);
    return NextResponse.json({ episodes: data.episodes }, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch {
    return NextResponse.json({ episodes: [] }, { status: 500 });
  }
}
