import Image from "next/image";
import Link from "next/link";
import { getTitle, getYear, posterUrl, type MediaItem, type MediaType } from "@/lib/tmdb";

type Props = {
  item: MediaItem;
  /** When the API doesn't include media_type (e.g. /movie/popular), pass it explicitly */
  forceType?: MediaType;
};

export function MediaCard({ item, forceType }: Props) {
  const type: MediaType = forceType ?? (item.media_type === "tv" ? "tv" : "movie");
  if (type !== "movie" && type !== "tv") return null;

  const href = `/${type}/${item.id}`;
  const poster = posterUrl(item.poster_path, "w342");
  const title = getTitle(item);
  const year = getYear(item);

  return (
    <Link
      href={href}
      className="group relative block w-34 sm:w-45 shrink-0"
    >
      <div className="aspect-2/3 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition group-hover:ring-brand/70">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            width={342}
            height={513}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-dim">
            No image
          </div>
        )}
        {item.vote_average > 0 && (
          <div className="absolute top-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium backdrop-blur">
            ★ {item.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <div className="line-clamp-1 text-sm font-medium">{title}</div>
        <div className="text-xs text-text-dim">
          {year} · {type === "movie" ? "Movie" : "TV"}
        </div>
      </div>
    </Link>
  );
}
