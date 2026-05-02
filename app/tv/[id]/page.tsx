import Link from "next/link";
import { DetailsHeader } from "@/components/DetailsHeader";
import { Row } from "@/components/Row";
import { SeasonPicker } from "@/components/SeasonPicker";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const t = await tmdbApi.tv(id);
    const desc = t.overview?.slice(0, 200) ?? `Watch ${t.name} online`;
    const poster = t.poster_path ? `https://image.tmdb.org/t/p/w780${t.poster_path}` : undefined;
    return {
      title: t.name,
      description: desc,
      alternates: { canonical: `/tv/${id}` },
      openGraph: {
        title: t.name ?? "TV Show",
        description: desc,
        type: "video.tv_show",
        url: `/tv/${id}`,
        images: poster ? [{ url: poster, width: 780, height: 1170 }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: t.name ?? "TV Show",
        description: desc,
        images: poster ? [poster] : undefined,
      },
    };
  } catch {
    return { title: "TV Show" };
  }
}

export default async function TvShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  const [tv, recs] = await Promise.all([tmdbApi.tv(id), tmdbApi.tvRecs(id)]);
  const firstSeason = tv.seasons.find((s) => s.season_number > 0)?.season_number ?? 1;

  return (
    <div className="pb-12">
      <DetailsHeader
        title={tv.name ?? "Untitled"}
        tagline={tv.tagline}
        overview={tv.overview}
        posterPath={tv.poster_path}
        backdropPath={tv.backdrop_path}
        meta={[
          tv.first_air_date?.slice(0, 4) ?? "",
          `${tv.number_of_seasons} season${tv.number_of_seasons === 1 ? "" : "s"}`,
          `${tv.number_of_episodes} episodes`,
          tv.vote_average ? `★ ${tv.vote_average.toFixed(1)}` : "",
          tv.status,
        ].filter(Boolean)}
        genres={tv.genres}
      />
      <div className="mx-auto max-w-7xl">
        <div className="px-4 sm:px-6 mt-2">
          <Link
            href={`/tv/${numId}/watch?s=${firstSeason}&e=1`}
            className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-5 py-2.5 text-sm font-semibold text-white transition"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play S{firstSeason} · E1
          </Link>
        </div>
        <SeasonPicker tvId={numId} seasons={tv.seasons} initialSeason={firstSeason} />
        <Row title="More Like This" items={recs.results} forceType="tv" />
      </div>
    </div>
  );
}
