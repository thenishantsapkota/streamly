import { DetailsHeader } from "@/components/DetailsHeader";
import { Player } from "@/components/Player";
import { Row } from "@/components/Row";
import type { CastEntry } from "@/components/CastOnPause";
import { backdropUrl, posterUrl, profileUrl, tmdbApi } from "@/lib/tmdb";

export const revalidate = 3600;

function fmtRuntime(min: number) {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const m = await tmdbApi.movie(id);
    const desc = m.overview?.slice(0, 200) ?? `Watch ${m.title} online`;
    const poster = m.poster_path ? `https://image.tmdb.org/t/p/w780${m.poster_path}` : undefined;
    return {
      title: m.title,
      description: desc,
      alternates: { canonical: `/movie/${id}` },
      openGraph: {
        title: m.title,
        description: desc,
        type: "video.movie",
        url: `/movie/${id}`,
        images: poster ? [{ url: poster, width: 780, height: 1170 }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: m.title,
        description: desc,
        images: poster ? [poster] : undefined,
      },
    };
  } catch {
    return { title: "Movie" };
  }
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  const [movie, recs, credits] = await Promise.all([
    tmdbApi.movie(id),
    tmdbApi.movieRecs(id),
    tmdbApi.movieCredits(id).catch(() => ({ cast: [] })),
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
        <Player
          id={numId}
          type="movie"
          title={movie.title ?? "Untitled"}
          poster={posterUrl(movie.poster_path, "w342")}
          backdrop={backdropUrl(movie.backdrop_path, "w780")}
          cast={cast}
        />
      </div>
      <DetailsHeader
        title={movie.title ?? "Untitled"}
        tagline={movie.tagline}
        overview={movie.overview}
        posterPath={movie.poster_path}
        backdropPath={movie.backdrop_path}
        meta={[
          movie.release_date?.slice(0, 4) ?? "",
          fmtRuntime(movie.runtime),
          movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : "",
          movie.status,
        ].filter(Boolean)}
        genres={movie.genres}
      />
      <div className="mx-auto max-w-7xl">
        <Row title="More Like This" items={recs.results} forceType="movie" />
      </div>
    </div>
  );
}
