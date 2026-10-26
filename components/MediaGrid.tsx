import { MediaCard } from "./MediaCard";
import { StaggerItem } from "./motion";
import type { MediaItem, MediaType } from "@/lib/tmdb";

type Props = {
  items: MediaItem[];
  forceType?: MediaType;
};

export function MediaGrid({ items, forceType }: Props) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5 px-4 sm:px-6">
      {items.map((item, i) => (
        <StaggerItem key={`${item.id}-${item.media_type ?? forceType}`} index={i % 6}>
          <MediaCard item={item} forceType={forceType} fluid />
        </StaggerItem>
      ))}
    </div>
  );
}
