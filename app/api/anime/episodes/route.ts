import { NextResponse } from "next/server";

export const revalidate = 86400;

type JikanEpisode = {
  mal_id: number;
  filler?: boolean;
  recap?: boolean;
  title?: string;
};

/**
 * Proxy + cache around Jikan's /anime/{id}/episodes endpoint. Used to surface
 * filler badges in the anime episode picker. Jikan paginates 100 per page.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mal = url.searchParams.get("mal");
  const page = url.searchParams.get("page") ?? "1";
  if (!mal || !/^\d+$/.test(mal)) {
    return NextResponse.json({ data: [], has_next: false });
  }
  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime/${mal}/episodes?page=${encodeURIComponent(page)}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return NextResponse.json({ data: [], has_next: false });
    const json = (await res.json()) as {
      data?: JikanEpisode[];
      pagination?: { has_next_page?: boolean };
    };
    const data = (json.data ?? []).map((e) => ({
      mal_id: e.mal_id,
      filler: !!e.filler,
      recap: !!e.recap,
    }));
    return NextResponse.json(
      { data, has_next: !!json.pagination?.has_next_page },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
    );
  } catch {
    return NextResponse.json({ data: [], has_next: false });
  }
}
