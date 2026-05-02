import { MediaCard } from "./MediaCard";
import { DraggableScroll } from "./DraggableScroll";
import type { MediaItem, MediaType } from "@/lib/tmdb";

type Props = {
  title: string;
  items: MediaItem[];
  forceType?: MediaType;
};

export function Row({ title, items, forceType }: Props) {
  if (!items?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 px-4 sm:px-6 text-lg font-semibold tracking-tight">{title}</h2>
      <DraggableScroll className="no-scrollbar flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 pb-2">
        {items.map((item) => (
          <MediaCard key={`${item.id}-${item.media_type ?? forceType}`} item={item} forceType={forceType} />
        ))}
      </DraggableScroll>
    </section>
  );
}
