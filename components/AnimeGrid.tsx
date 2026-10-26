import { AnimeCard } from "./AnimeCard";
import { StaggerItem } from "./motion";
import type { Anime } from "@/lib/anilist";

export function AnimeGrid({ items }: { items: Anime[] }) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5 px-4 sm:px-6">
      {items.map((a, i) => (
        <StaggerItem key={a.id} index={i % 6}>
          <AnimeCard anime={a} fluid />
        </StaggerItem>
      ))}
    </div>
  );
}
