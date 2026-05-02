import { MediaCard } from "./MediaCard";
import type { MediaItem, MediaType } from "@/lib/tmdb";

type Props = {
  items: MediaItem[];
  forceType?: MediaType;
};

export function MediaGrid({ items, forceType }: Props) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 px-4 sm:px-6">
      {items.map((item) => (
        <MediaCard
          key={`${item.id}-${item.media_type ?? forceType}`}
          item={item}
          forceType={forceType}
          fluid
        />
      ))}
    </div>
  );
}
