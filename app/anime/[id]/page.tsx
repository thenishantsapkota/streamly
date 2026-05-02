import Link from "next/link";
import { anilistApi, animeIsMovie, animeTitle, getEpisodeCount } from "@/lib/anilist";
import { AnimeEpisodeList } from "@/components/AnimeEpisodeList";

export const revalidate = 3600;

function stripHtml(s: string | null) {
  if (!s) return "";
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
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

  return (
    <div className="pb-12">
      <section className="relative">
        {banner && (
          <div className="absolute inset-x-0 top-0 h-105 -z-10 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner} alt="" className="h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-bg/70 to-bg" />
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8 pb-6 flex gap-4 sm:gap-6">
          <div className="block w-24 sm:w-44 shrink-0">
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt={title}
                className="aspect-2/3 w-full rounded-lg object-cover ring-1 ring-border"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-5xl font-bold tracking-tight">{title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-dim">
              <span>{a.seasonYear ?? "—"}</span>
              <span>•</span>
              <span>{a.format ?? "Anime"}</span>
              {!isMovie && epCount && (
                <>
                  <span>•</span>
                  <span>
                    {epCount} episode{epCount === 1 ? "" : "s"}
                    {a.episodes == null ? " aired" : ""}
                  </span>
                </>
              )}
              {a.duration && (
                <>
                  <span>•</span>
                  <span>{a.duration} min</span>
                </>
              )}
              {a.averageScore != null && (
                <>
                  <span>•</span>
                  <span>★ {(a.averageScore / 10).toFixed(1)}</span>
                </>
              )}
              <span>•</span>
              <span>{a.status}</span>
            </div>
            {a.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {a.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-4 max-w-3xl text-sm sm:text-base text-white/90">{stripHtml(a.description)}</p>
            <div className="mt-6 flex gap-3">
              <Link
                href={isMovie ? `/anime/${a.id}/watch` : `/anime/${a.id}/watch?e=1`}
                className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-5 py-2.5 text-sm font-semibold text-white transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {isMovie ? "Play movie" : "Play E1"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {!isMovie && (
        <div className="mx-auto max-w-7xl">
          <AnimeEpisodeList animeId={a.id} totalEpisodes={epCount} />
        </div>
      )}
    </div>
  );
}
