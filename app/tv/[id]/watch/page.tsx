import Link from "next/link";
import { Player } from "@/components/Player";
import { SeasonPicker } from "@/components/SeasonPicker";
import type { CastEntry } from "@/components/CastOnPause";
import { backdropUrl, posterUrl, profileUrl, tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string; e?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  try {
    const t = await tmdbApi.tv(id);
    return { title: `${t.name} S${sp.s ?? 1}·E${sp.e ?? 1} — Streamly` };
  } catch {
    return { title: "Watch — Streamly" };
  }
}

export default async function TvWatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string; e?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const season = Math.max(1, Number(sp.s ?? 1));
  const episode = Math.max(1, Number(sp.e ?? 1));
  const numId = Number(id);

  const [tv, credits] = await Promise.all([
    tmdbApi.tv(id),
    tmdbApi.tvCredits(id).catch(() => ({ cast: [] })),
  ]);

  const cast: CastEntry[] = credits.cast
    .slice(0, 20)
    .map((c) => ({
      personId: c.id,
      personName: c.name,
      personImage: profileUrl(c.profile_path, "w185"),
      character: c.character || "—",
    }));

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="min-w-0">
            <Link href={`/tv/${numId}`} className="text-sm text-text-dim hover:text-white">
              ← {tv.name}
            </Link>
            <div className="text-2xl font-bold tracking-tight">
              Season {season} · Episode {episode}
            </div>
          </div>
        </div>
        <Player
          id={numId}
          type="tv"
          title={tv.name ?? "Untitled"}
          poster={posterUrl(tv.poster_path, "w342")}
          backdrop={backdropUrl(tv.backdrop_path, "w780")}
          season={season}
          episode={episode}
          cast={cast}
        />
      </div>
      <div className="mx-auto max-w-7xl">
        <SeasonPicker
          tvId={numId}
          seasons={tv.seasons}
          initialSeason={season}
          initialEpisode={episode}
        />
      </div>
    </div>
  );
}
