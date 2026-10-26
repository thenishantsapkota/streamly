import Link from "next/link";
import { Player } from "@/components/Player";
import { SeasonPicker } from "@/components/SeasonPicker";
import { EpisodeNav } from "@/components/EpisodeNav";
import type { CastEntry } from "@/components/CastOnPause";
import { backdropUrl, isAnimeTv, posterUrl, profileUrl, tmdbApi } from "@/lib/tmdb";
import { anilistApi } from "@/lib/anilist";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal, SplitTitle } from "@/components/motion";

export const revalidate = 3600;

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ s?: string; e?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  try {
    const t = await tmdbApi.tv(id);
    return { title: `${t.name} S${sp.s ?? 1} E${sp.e ?? 1} - Streamly` };
  } catch {
    return { title: "Watch - Streamly" };
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

  let malId: number | null = null;
  if (isAnimeTv(tv)) {
    try {
      const matches = await anilistApi.search(tv.original_name || tv.name || "", 1);
      malId = matches[0]?.idMal ?? null;
    } catch {
      malId = null;
    }
  }

  const cast: CastEntry[] = credits.cast
    .slice(0, 20)
    .map((c) => ({
      personId: c.id,
      personName: c.name,
      personImage: profileUrl(c.profile_path, "w185"),
      character: c.character || "",
    }));

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
        <header className="mb-6 sm:mb-8">
          <Link
            href={`/tv/${numId}`}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-brand"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" weight="bold" aria-hidden />
            Back to series
          </Link>
          <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-2">
            <SplitTitle
              text={tv.name ?? "Untitled"}
              className="min-w-0 max-w-4xl text-3xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl"
            />
            <Reveal y={8} delay={0.2} className="mb-1.5 flex items-center gap-4 tabular-nums text-xs uppercase text-text-dim">
              <span className="text-brand">Season {season}</span>
              <span className="text-text">Episode {episode}</span>
            </Reveal>
          </div>
        </header>
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
        <EpisodeNav
          tvId={numId}
          seasons={tv.seasons}
          currentSeason={season}
          currentEpisode={episode}
        />
      </div>
      <div className="mx-auto max-w-7xl">
        <SeasonPicker
          tvId={numId}
          seasons={tv.seasons}
          initialSeason={season}
          initialEpisode={episode}
          malId={malId}
        />
      </div>
    </div>
  );
}
