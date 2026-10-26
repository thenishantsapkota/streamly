import Image from "next/image";
import Link from "next/link";
import { anilistApi, animeIsMovie, animeTitle, getEpisodeCount } from "@/lib/anilist";
import { AnimeEpisodeList } from "@/components/AnimeEpisodeList";
import { ParallaxBackdrop, Reveal, SplitTitle, TiltCard } from "@/components/motion";
import { BLUR_DATA_URL, BLUR_DATA_URL_LANDSCAPE } from "@/lib/image";
import { PlayIcon, StarIcon } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 3600;

function stripHtml(s: string | null) {
  if (!s) return "";
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** "TV_SHORT" -> "TV Short", "FINISHED" -> "Finished". */
function prettyEnum(s: string | null) {
  if (!s) return "";
  return s
    .split("_")
    .map((w) => (w === "TV" || w === "OVA" || w === "ONA" ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(" ");
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const a = await anilistApi.byId(id);
    const title = animeTitle(a);
    const desc = stripHtml(a.description).slice(0, 200) || `Watch ${title} online`;
    const poster = a.coverImage.extraLarge || a.coverImage.large;
    return {
      title,
      description: desc,
      alternates: { canonical: `/anime/${id}` },
      openGraph: {
        title,
        description: desc,
        type: "video.tv_show",
        url: `/anime/${id}`,
        images: poster ? [{ url: poster }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: desc,
        images: poster ? [poster] : undefined,
      },
    };
  } catch {
    return { title: "Anime" };
  }
}

export default async function AnimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await anilistApi.byId(id);
  const title = animeTitle(a);
  const isMovie = animeIsMovie(a);
  const epCount = getEpisodeCount(a);
  const banner = a.bannerImage;
  const poster = a.coverImage.extraLarge || a.coverImage.large;
  const synopsis = stripHtml(a.description);
  const score = a.averageScore != null ? (a.averageScore / 10).toFixed(1) : null;
  const format = prettyEnum(a.format) || "Anime";
  const status = prettyEnum(a.status);
  const nativeTitle = a.title.native && a.title.native !== title ? a.title.native : null;
  const romaji = a.title.romaji && a.title.romaji !== title ? a.title.romaji : null;
  const playHref = isMovie ? `/anime/${a.id}/watch` : `/anime/${a.id}/watch?e=1`;

  return (
    <div className="pb-12">
      <section className="relative -mt-16 isolate min-h-[88dvh] overflow-hidden sm:min-h-[80dvh]">
        <ParallaxBackdrop className="absolute inset-0 -z-10">
          <div className="absolute inset-0 overflow-hidden bg-bg">
            {banner ? (
              <Image
                src={banner}
                alt=""
                fill
                priority
                sizes="100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL_LANDSCAPE}
                className="object-cover"
              />
            ) : poster ? (
              <Image
                src={poster}
                alt=""
                fill
                priority
                sizes="100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL_LANDSCAPE}
                className="scale-110 object-cover opacity-60 blur-2xl"
              />
            ) : null}
          </div>
        </ParallaxBackdrop>
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/60 via-45% to-bg/20" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-bg/90 via-bg/40 via-55% to-transparent" />

        <div className="mx-auto flex min-h-[88dvh] max-w-7xl items-end gap-10 px-4 pb-12 pt-28 sm:min-h-[80dvh] sm:px-6 sm:pb-16">
          <div className="min-w-0 flex-1">
            <Reveal y={12} className="flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums text-xs uppercase text-white/70">
              {a.seasonYear ? <span>{a.seasonYear}</span> : <span>TBA</span>}
              <span>{format}</span>
              {!isMovie && epCount ? (
                <span>
                  {epCount} episode{epCount === 1 ? "" : "s"}
                  {a.episodes == null ? " aired" : ""}
                </span>
              ) : null}
              {a.duration ? <span>{a.duration} min</span> : null}
              {score && (
                <span className="inline-flex items-center gap-1 text-brand">
                  <StarIcon className="size-3" weight="fill" aria-hidden />
                  {score}
                </span>
              )}
            </Reveal>
            <SplitTitle
              text={title}
              delay={0.1}
              className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tighter sm:text-6xl lg:text-7xl"
            />
            {nativeTitle && (
              <Reveal delay={0.35} y={12}>
                <p className="mt-4 text-base text-white/60 sm:text-lg">{nativeTitle}</p>
              </Reveal>
            )}
            <Reveal delay={0.45} y={16}>
              {synopsis && (
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 line-clamp-3 sm:text-base">
                  {synopsis}
                </p>
              )}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={playHref}
                  className="group inline-flex items-center gap-2.5 bg-brand px-7 py-3 text-sm font-semibold text-on-brand transition hover:bg-brand-hover active:scale-[0.98]"
                >
                  <PlayIcon className="size-4 transition-transform duration-300 group-hover:scale-110" weight="fill" aria-hidden />
                  {isMovie ? "Play movie" : "Play E1"}
                </Link>
              </div>
            </Reveal>
          </div>

          {poster && (
            <Reveal delay={0.3} className="hidden w-56 shrink-0 lg:block xl:w-64">
              <TiltCard className="aspect-2/3">
                <div className="relative h-full w-full overflow-hidden bg-surface-2 shadow-[0_0_0_1px_var(--color-border),0_32px_64px_-16px_rgb(0_0_0/0.9)]">
                  <Image
                    src={poster}
                    alt={title}
                    fill
                    sizes="256px"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover"
                  />
                </div>
              </TiltCard>
            </Reveal>
          )}
        </div>
      </section>

      <div className="mx-auto mt-6 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Reveal>
          <h2 className="text-xl font-semibold tracking-tight">Synopsis</h2>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-white/80">
            {synopsis || "No synopsis available."}
          </p>
          {a.genres.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {a.genres.map((g) => (
                <span
                  key={g}
                  className="border border-border px-3 py-1.5 text-xs text-text-dim transition hover:border-brand hover:text-brand"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-border pt-5 text-sm">
            <dt className="text-text-dim">Format</dt>
            <dd className="font-medium">{format}</dd>
            {!isMovie && epCount ? (
              <>
                <dt className="text-text-dim">Episodes</dt>
                <dd className="tabular-nums">
                  {epCount}
                  {a.episodes == null ? " aired" : ""}
                </dd>
              </>
            ) : null}
            {a.duration ? (
              <>
                <dt className="text-text-dim">{isMovie ? "Runtime" : "Episode length"}</dt>
                <dd className="tabular-nums">{a.duration} min</dd>
              </>
            ) : null}
            {status && (
              <>
                <dt className="text-text-dim">Status</dt>
                <dd>{status}</dd>
              </>
            )}
            {a.seasonYear ? (
              <>
                <dt className="text-text-dim">Year</dt>
                <dd className="tabular-nums">{a.seasonYear}</dd>
              </>
            ) : null}
            {romaji && (
              <>
                <dt className="text-text-dim">Romaji</dt>
                <dd>{romaji}</dd>
              </>
            )}
            {nativeTitle && (
              <>
                <dt className="text-text-dim">Native</dt>
                <dd>{nativeTitle}</dd>
              </>
            )}
          </dl>
        </Reveal>
      </div>

      {!isMovie && (
        <div className="mx-auto max-w-7xl">
          <AnimeEpisodeList animeId={a.id} malId={a.idMal} totalEpisodes={epCount} streamingEpisodes={a.streamingEpisodes} />
        </div>
      )}
    </div>
  );
}
