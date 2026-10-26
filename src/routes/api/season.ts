import { createFileRoute } from "@tanstack/react-router";
import { tmdbApi } from "@/lib/tmdb";

async function GET(req: Request) {
  const url = new URL(req.url);
  const tv = url.searchParams.get("tv");
  const season = url.searchParams.get("season");
  if (!tv || !season) {
    return Response.json({ error: "missing params" }, { status: 400 });
  }
  try {
    const data = await tmdbApi.season(tv, season);
    return Response.json({ episodes: data.episodes }, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch {
    return Response.json({ episodes: [] }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/season")({
  server: { handlers: { GET: ({ request }) => GET(request) } },
});
