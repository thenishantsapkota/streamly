import { createFileRoute } from "@tanstack/react-router";
import { anilistExtra } from "@/lib/anilist";

async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const kind = url.searchParams.get("kind") ?? "character";
  if (!id) return Response.json({ error: "missing id" }, { status: 400 });
  try {
    if (kind === "staff") {
      const s = await anilistExtra.staff(id);
      return Response.json(s, {
        headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
      });
    }
    const c = await anilistExtra.character(id);
    return Response.json(c, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    });
  } catch {
    return Response.json({ error: "not found" }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/character")({
  server: { handlers: { GET: ({ request }) => GET(request) } },
});
