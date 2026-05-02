import { AnimeCard } from "./AnimeCard";
import type { Anime } from "@/lib/anilist";

export function AnimeGrid({ items }: { items: Anime[] }) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 px-4 sm:px-6">
      {items.map((a) => (
        <AnimeCard key={a.id} anime={a} fluid />
      ))}
    </div>
  );
}
