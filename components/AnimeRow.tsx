import Link from "next/link";
import { AnimeCard } from "./AnimeCard";
import { DraggableScroll } from "./DraggableScroll";
import type { Anime } from "@/lib/anilist";

export function AnimeRow({
  title,
  items,
  viewAllHref,
}: {
  title: string;
  items: Anime[];
  viewAllHref?: string;
}) {
  if (!items?.length) return null;
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between gap-3 px-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs sm:text-sm text-text-dim hover:text-white shrink-0"
          >
            View all →
          </Link>
        )}
      </div>
      <DraggableScroll className="no-scrollbar flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 pb-2">
        {items.map((a) => (
          <AnimeCard key={a.id} anime={a} />
        ))}
      </DraggableScroll>
    </section>
  );
}
