import { getTitle, getYear, posterUrl, type MediaItem, type MediaType } from "@/lib/tmdb";
import { PosterCard } from "./PosterCard";

type Props = {
  item: MediaItem;
  /** When the API doesn't include media_type (e.g. /movie/popular), pass it explicitly */
  forceType?: MediaType;
  /** When true, the card fills its container width instead of using a fixed width. */
  fluid?: boolean;
};

export function MediaCard({ item, forceType, fluid }: Props) {
  const type: MediaType = forceType ?? (item.media_type === "tv" ? "tv" : "movie");
  if (type !== "movie" && type !== "tv") return null;

  return (
    <PosterCard
      href={`/${type}/${item.id}`}
      title={getTitle(item)}
      poster={posterUrl(item.poster_path, "w342")}
      meta={[getYear(item), type === "movie" ? "Film" : "Series"]}
      rating={item.vote_average || null}
      overview={item.overview}
      fluid={fluid}
    />
  );
}
