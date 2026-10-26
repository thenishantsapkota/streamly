import { MediaCard } from "./MediaCard";
import { DraggableScroll } from "./DraggableScroll";
import { RowHeader } from "./RowHeader";
import { StaggerItem } from "./motion";
import type { MediaItem, MediaType } from "@/lib/tmdb";

type Props = {
  title: string;
  items: MediaItem[];
  forceType?: MediaType;
  /** When provided, renders a "See all" link on the right of the title. */
  viewAllHref?: string;
};

export function Row({ title, items, forceType, viewAllHref }: Props) {
  if (!items?.length) return null;
  return (
    <section className="mt-14">
      <RowHeader title={title} href={viewAllHref} />
      <DraggableScroll className="no-scrollbar flex gap-4 sm:gap-5 overflow-x-auto px-4 sm:px-6 pt-2 pb-4">
        {items.map((item, i) => (
          <StaggerItem key={`${item.id}-${item.media_type ?? forceType}`} index={i} className="shrink-0">
            <MediaCard item={item} forceType={forceType} />
          </StaggerItem>
        ))}
      </DraggableScroll>
    </section>
  );
}
