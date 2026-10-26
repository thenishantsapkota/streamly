import { animeTitle, type Anime } from "@/lib/anilist";
import { PosterCard } from "./PosterCard";

export function AnimeCard({ anime, fluid }: { anime: Anime; fluid?: boolean }) {
  return (
    <PosterCard
      href={`/anime/${anime.id}`}
      title={animeTitle(anime)}
      poster={anime.coverImage.extraLarge || anime.coverImage.large}
      meta={[
        anime.seasonYear ? String(anime.seasonYear) : "",
        anime.format ?? "Anime",
        anime.episodes ? `${anime.episodes} ep` : "",
      ]}
      rating={anime.averageScore != null ? anime.averageScore / 10 : null}
      overview={anime.description?.replace(/<[^>]+>/g, "") ?? undefined}
      fluid={fluid}
    />
  );
}
