import { Link } from "@/lib/router-compat";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal, SplitTitle } from "@/components/motion";
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
    return { title: `${animeTitle(a)}${ep} - Streamly` };
  } catch {
    return { title: "Watch - Streamly" };
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

  // Look up a TMDB id by title so vidsrc (TMDB-only) can be offered as an
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
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
        <header className="mb-6 sm:mb-8">
          <Link
            href={`/anime/${numId}`}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-wider text-text-dim transition-colors hover:text-brand"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" weight="bold" aria-hidden />
            Back to details
          </Link>
          <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-2">
            <SplitTitle
              text={title}
              className="min-w-0 max-w-4xl text-3xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl"
            />
            <Reveal y={8} delay={0.2} className="mb-1.5 flex items-center gap-4 tabular-nums text-xs uppercase text-text-dim">
              <span className="text-brand">{isMovie ? "Movie" : `Episode ${episode}`}</span>
              {a.seasonYear ? <span>{a.seasonYear}</span> : null}
            </Reveal>
          </div>
        </header>
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
