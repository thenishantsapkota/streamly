import { NextResponse } from "next/server";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 86400;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  try {
    const p = await tmdbApi.person(id);
    return NextResponse.json(
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
    return NextResponse.json({ error: "not found" }, { status: 500 });
  }
}
