import Image from "next/image";
import Link from "next/link";
import { getTitle, getYear, posterUrl, type MediaItem, type MediaType } from "@/lib/tmdb";

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

  const href = `/${type}/${item.id}`;
  const poster = posterUrl(item.poster_path, "w342");
  const title = getTitle(item);
  const year = getYear(item);

  return (
    <Link
      href={href}
      className={`group relative block ${fluid ? "w-full" : "w-34 sm:w-45 shrink-0"} transition-transform duration-200 hover:-translate-y-1`}
    >
      <div className="aspect-2/3 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition-shadow duration-200 group-hover:ring-brand/70 group-hover:shadow-lg group-hover:shadow-black/40">
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
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-2.5 shadow-lg text-black">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
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
