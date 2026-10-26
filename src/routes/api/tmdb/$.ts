import { createFileRoute } from "@tanstack/react-router";
import { cached, HOUR } from "@/lib/cache";

const TMDB_BASE = "https://api.themoviedb.org/3";

/** Read-only TMDB proxy: /api/tmdb/<path>?<params> keeps the API key server-side. */
export const Route = createFileRoute("/api/tmdb/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const apiKey = process.env.TMDB_API_KEY;
        if (!apiKey) return Response.json({ error: "TMDB_API_KEY not set" }, { status: 500 });

        const tmdbUrl = new URL(`${TMDB_BASE}/${params._splat ?? ""}`);
        new URL(request.url).searchParams.forEach((v, k) => tmdbUrl.searchParams.set(k, v));
        tmdbUrl.searchParams.set("api_key", apiKey);

        try {
          const data = await cached(tmdbUrl.toString(), HOUR, async () => {
            const res = await fetch(tmdbUrl.toString());
            if (!res.ok) throw new Response(null, { status: res.status });
            return res.json();
          });
          return Response.json(data, {
            headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
          });
        } catch (err) {
          const status = err instanceof Response ? err.status : 502;
          return Response.json({ error: `TMDB ${status}` }, { status });
        }
      },
    },
  },
});
