import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY not set" }, { status: 500 });

  const tmdbPath = "/" + path.join("/");
  const tmdbUrl = new URL(`${TMDB_BASE}${tmdbPath}`);
  tmdbUrl.searchParams.set("api_key", apiKey);

  // Forward all query params from the original request
  req.nextUrl.searchParams.forEach((v, k) => {
    tmdbUrl.searchParams.set(k, v);
  });

  const res = await fetch(tmdbUrl.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    return NextResponse.json({ error: `TMDB ${res.status}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
