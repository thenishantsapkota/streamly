import { NextResponse } from "next/server";
import { anilistExtra } from "@/lib/anilist";

export const revalidate = 86400;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const kind = url.searchParams.get("kind") ?? "character";
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  try {
    if (kind === "staff") {
      const s = await anilistExtra.staff(id);
      return NextResponse.json(s, {
        headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
      });
    }
    const c = await anilistExtra.character(id);
    return NextResponse.json(c, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 500 });
  }
}
