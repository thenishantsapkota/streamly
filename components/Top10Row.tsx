import Image from "next/image";
import Link from "next/link";
import { DraggableScroll } from "./DraggableScroll";
import { getTitle, posterUrl, type MediaItem, type MediaType } from "@/lib/tmdb";

type Props = {
  title: string;
  items: MediaItem[];
  forceType?: MediaType;
};

export function Top10Row({ title, items, forceType }: Props) {
  const top10 = items.slice(0, 10);
  if (!top10.length) return null;

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between gap-3 px-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <Link
          href="/trending"
          className="text-xs sm:text-sm text-text-dim hover:text-white shrink-0"
        >
          View all →
        </Link>
      </div>
      <DraggableScroll className="no-scrollbar flex gap-4 sm:gap-5 overflow-x-auto px-4 sm:px-6 pb-2">
        {top10.map((item, i) => {
          const type: MediaType =
            forceType ?? (item.media_type === "tv" ? "tv" : "movie");
          const href = `/${type}/${item.id}`;
          const poster = posterUrl(item.poster_path, "w342");
          const name = getTitle(item);
          const rank = i + 1;

          return (
            <Link
              key={`${item.id}-${type}`}
              href={href}
              className="group shrink-0"
            >
              <div className="flex items-end gap-0">
                {/* Rank number — italic, outlined, tucked behind the poster edge */}
                <span
                  className="select-none font-black italic leading-none text-bg relative z-0"
                  style={{
                    fontSize: rank === 10 ? "5.5rem" : "6.5rem",
                    WebkitTextStroke: "2.5px rgba(255,255,255,0.4)",
                    marginRight: rank === 10 ? "-0.6rem" : "-0.85rem",
                    marginBottom: "-0.15rem",
                  }}
                >
                  {rank}
                </span>
                {/* Poster card */}
                <div className="relative z-10 w-28 sm:w-36 shrink-0">
                  <div className="aspect-2/3 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition group-hover:ring-brand/70">
                    {poster ? (
                      <Image
                        src={poster}
                        alt={name}
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
                  </div>
                </div>
              </div>
              <div className="mt-2 pl-6 sm:pl-8">
                <div className="line-clamp-1 text-sm font-medium">{name}</div>
              </div>
            </Link>
          );
        })}
      </DraggableScroll>
    </section>
  );
}
