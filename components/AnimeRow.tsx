import { AnimeCard } from "./AnimeCard";
import { DraggableScroll } from "./DraggableScroll";
import { RowHeader } from "./RowHeader";
import { StaggerItem } from "./motion";
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
    <section className="mt-14">
      <RowHeader title={title} href={viewAllHref} />
      <DraggableScroll className="no-scrollbar flex gap-4 sm:gap-5 overflow-x-auto px-4 sm:px-6 pt-2 pb-4">
        {items.map((a, i) => (
          <StaggerItem key={a.id} index={i} className="shrink-0">
            <AnimeCard anime={a} />
          </StaggerItem>
        ))}
      </DraggableScroll>
    </section>
  );
}
