import { AnimeCard } from "./AnimeCard";
import type { Anime } from "@/lib/anilist";

export function AnimeRow({ title, items }: { title: string; items: Anime[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 px-4 sm:px-6 text-lg font-semibold tracking-tight">{title}</h2>
      <div className="no-scrollbar flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 pb-2">
        {items.map((a) => (
          <AnimeCard key={a.id} anime={a} />
        ))}
      </div>
    </section>
  );
}
