import Link from "next/link";
import { animeTitle, type Anime } from "@/lib/anilist";

export function AnimeCard({ anime }: { anime: Anime }) {
  const title = animeTitle(anime);
  const poster = anime.coverImage.extraLarge || anime.coverImage.large;
  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group relative block w-[160px] sm:w-[180px] shrink-0"
    >
      <div className="aspect-2/3 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border transition group-hover:ring-brand/70">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-dim">
            No image
          </div>
        )}
        {anime.averageScore != null && (
          <div className="absolute top-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium backdrop-blur">
            ★ {(anime.averageScore / 10).toFixed(1)}
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <div className="line-clamp-1 text-sm font-medium">{title}</div>
        <div className="text-xs text-text-dim">
          {anime.seasonYear ?? ""} · {anime.format ?? "Anime"}
          {anime.episodes ? ` · ${anime.episodes} ep` : ""}
        </div>
      </div>
    </Link>
  );
}
