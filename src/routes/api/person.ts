import { createFileRoute } from "@tanstack/react-router";
import { tmdbApi } from "@/lib/tmdb";

async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "missing id" }, { status: 400 });
  try {
    const p = await tmdbApi.person(id);
    return Response.json(
      {
        id: p.id,
        name: p.name,
        biography: p.biography,
        birthday: p.birthday,
        deathday: p.deathday,
        place_of_birth: p.place_of_birth,
        known_for_department: p.known_for_department,
        profile_path: p.profile_path,
      },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
    );
  } catch {
    return Response.json({ error: "not found" }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/person")({
  server: { handlers: { GET: ({ request }) => GET(request) } },
});
