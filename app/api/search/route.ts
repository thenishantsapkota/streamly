import { NextResponse } from "next/server";
import { posterUrl, tmdbApi } from "@/lib/tmdb";
import { anilistApi, animeTitle } from "@/lib/anilist";

export const revalidate = 600;

export type SearchKind = "movie" | "tv" | "anime";

export type SearchResult = {
  id: number;
  kind: SearchKind;
  title: string;
  /** Full poster URL ready to render (TMDB CDN or AniList CDN) */
  poster: string | null;
  /** 0–10 scale */
  rating: number;
  year: string;
  /** Short label like "Movie", "TV", "Anime · TV" */
  label: string;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json(
      { results: [] },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=600" } },
    );
  }

  const [tmdb, anime] = await Promise.all([
    tmdbApi.search(q).catch(() => ({ results: [] as Awaited<ReturnType<typeof tmdbApi.search>>["results"] })),
    anilistApi.search(q, 8).catch(() => []),
  ]);

  const tmdbResults: SearchResult[] = tmdb.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .slice(0, 8)
    .map((r) => ({
      id: r.id,
      kind: (r.media_type === "tv" ? "tv" : "movie") as SearchKind,
      title: r.title ?? r.name ?? "",
      poster: posterUrl(r.poster_path, "w185"),
      rating: r.vote_average ?? 0,
      year: (r.release_date || r.first_air_date || "").slice(0, 4),
      label: r.media_type === "tv" ? "TV" : "Movie",
    }));

  const animeResults: SearchResult[] = anime.slice(0, 8).map((a) => ({
    id: a.id,
    kind: "anime",
    title: animeTitle(a),
    poster: a.coverImage?.extraLarge || a.coverImage?.large || null,
    rating: a.averageScore != null ? a.averageScore / 10 : 0,
    year: a.seasonYear ? String(a.seasonYear) : "",
    label: a.format ? `Anime · ${a.format}` : "Anime",
  }));

  // Dedup roughly: if the same title+year exists as both a TMDB TV and an
  // AniList entry, drop the TMDB one — AniList has richer anime data and
  // sub/dub support via videasy's anime route.
  const animeKeys = new Set(
    animeResults.map((a) => `${a.title.toLowerCase()}|${a.year}`),
  );
  const dedupedTmdb = tmdbResults.filter(
    (t) => !animeKeys.has(`${t.title.toLowerCase()}|${t.year}`),
  );

  // Interleave: anime first when query strongly matches anime titles, otherwise
  // sort by rating overall. Simpler heuristic: combine and sort by rating.
  const merged = [...animeResults, ...dedupedTmdb];
  merged.sort((a, b) => {
    // Promote items whose title starts with the query
    const ql = q.toLowerCase();
    const aStarts = a.title.toLowerCase().startsWith(ql);
    const bStarts = b.title.toLowerCase().startsWith(ql);
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  return NextResponse.json(
    { results: merged.slice(0, 12) },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=600" } },
  );
}
