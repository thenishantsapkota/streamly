import { createFileRoute } from "@tanstack/react-router";

const ANILIST = "https://graphql.anilist.co";

const LIST_FIELDS = `
  id idMal
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage format episodes averageScore seasonYear genres status isAdult
  nextAiringEpisode { episode }
`;

const QUERIES: Record<string, string> = {
  trending: `query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ${LIST_FIELDS} }
    }
  }`,
  popular: `query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) { ${LIST_FIELDS} }
    }
  }`,
  "top-rated": `query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(sort: SCORE_DESC, type: ANIME, isAdult: false) { ${LIST_FIELDS} }
    }
  }`,
};

async function GET(req: Request) {
  const type = new URL(req.url).searchParams.get("type");
  const perPage = Number(new URL(req.url).searchParams.get("perPage") ?? 24);

  if (!type || !QUERIES[type]) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  const res = await fetch(ANILIST, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: QUERIES[type], variables: { perPage } }),
  });

  if (!res.ok) {
    return Response.json({ error: `AniList ${res.status}` }, { status: res.status });
  }

  const json = await res.json();
  return Response.json(json.data?.Page?.media ?? [], {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

export const Route = createFileRoute("/api/anilist")({
  server: { handlers: { GET: ({ request }) => GET(request) } },
});
