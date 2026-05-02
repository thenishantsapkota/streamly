import Link from "next/link";
import { Player } from "@/components/Player";
import { AnimeEpisodeList } from "@/components/AnimeEpisodeList";
import { AnimeEpisodeNav } from "@/components/AnimeEpisodeNav";
import type { CastEntry } from "@/components/CastOnPause";
import { anilistApi, anilistExtra, animeIsMovie, animeTitle, getEpisodeCount } from "@/lib/anilist";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  try {
    const a = await anilistApi.byId(id);
    const ep = sp.e ? ` E${sp.e}` : "";
    return { title: `${animeTitle(a)}${ep} — Streamly` };
  } catch {
    return { title: "Watch — Streamly" };
  }
}

export default async function AnimeWatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [a, characters] = await Promise.all([
    anilistApi.byId(id),
    anilistExtra.characters(id).catch(() => []),
  ]);
  const numId = Number(id);
  const isMovie = animeIsMovie(a);

  // Look up a TMDB id by title so vidking (TMDB-only) can be offered as an
  // alternate source when videasy doesn't have the title in its library.
  const searchTitle = a.title.english || a.title.romaji || "";
  const tmdbId = searchTitle
    ? await tmdbApi.findAnimeTmdbId(searchTitle, isMovie).catch(() => null)
    : null;
  const tmdbAlt = tmdbId ? { id: tmdbId, type: isMovie ? ("movie" as const) : ("tv" as const) } : null;

  // For anime, the "person" we look up is the voice actor; the "character"
  // is the role they play in the show.
  const cast: CastEntry[] = characters
    .filter((c) => c.voiceActor)
    .slice(0, 20)
    .map((c) => ({
      personId: c.voiceActor!.id,
      personName: c.voiceActor!.name,
      personImage: c.voiceActor!.image,
      character: c.name,
      characterId: c.id,
      characterImage: c.image,
    }));
  const episode = isMovie ? undefined : Math.max(1, Number(sp.e ?? 1));
  const title = animeTitle(a);
  const poster = a.coverImage.extraLarge || a.coverImage.large;

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <Link href={`/anime/${numId}`} className="text-sm text-text-dim hover:text-white">
          ← {title}
        </Link>
        <div className="mt-1 mb-3 text-2xl font-bold tracking-tight">
          {isMovie ? "Movie" : `Episode ${episode}`}
        </div>
        <Player
          id={numId}
          type="anime"
          title={title}
          poster={poster}
          backdrop={a.bannerImage}
          episode={episode}
          cast={cast}
          tmdbAlt={tmdbAlt}
        />
        {!isMovie && episode != null && (
          <AnimeEpisodeNav
            animeId={numId}
            currentEpisode={episode}
            totalEpisodes={getEpisodeCount(a)}
          />
        )}
      </div>
      {!isMovie && (
        <div className="mx-auto max-w-7xl">
          <AnimeEpisodeList
            animeId={numId}
            malId={a.idMal}
            totalEpisodes={getEpisodeCount(a)}
            activeEpisode={episode}
            streamingEpisodes={a.streamingEpisodes}
          />
        </div>
      )}
    </div>
  );
}
