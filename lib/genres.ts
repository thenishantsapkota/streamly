export interface GenreDef {
  slug: string;
  name: string;
  movieId: number | null;
  tvId: number | null;
}

export const GENRES: GenreDef[] = [
  { slug: "action", name: "Action", movieId: 28, tvId: 10759 },
  { slug: "adventure", name: "Adventure", movieId: 12, tvId: 10759 },
  { slug: "animation", name: "Animation", movieId: 16, tvId: 16 },
  { slug: "comedy", name: "Comedy", movieId: 35, tvId: 35 },
  { slug: "crime", name: "Crime", movieId: 80, tvId: 80 },
  { slug: "documentary", name: "Documentary", movieId: 99, tvId: 99 },
  { slug: "drama", name: "Drama", movieId: 18, tvId: 18 },
  { slug: "family", name: "Family", movieId: 10751, tvId: 10751 },
  { slug: "fantasy", name: "Fantasy", movieId: 14, tvId: 10765 },
  { slug: "history", name: "History", movieId: 36, tvId: null },
  { slug: "horror", name: "Horror", movieId: 27, tvId: null },
  { slug: "music", name: "Music", movieId: 10402, tvId: null },
  { slug: "mystery", name: "Mystery", movieId: 9648, tvId: 9648 },
  { slug: "romance", name: "Romance", movieId: 10749, tvId: null },
  { slug: "sci-fi", name: "Sci-Fi", movieId: 878, tvId: 10765 },
  { slug: "thriller", name: "Thriller", movieId: 53, tvId: null },
  { slug: "war", name: "War", movieId: 10752, tvId: 10768 },
  { slug: "western", name: "Western", movieId: 37, tvId: 37 },
];

export function findGenre(slug: string): GenreDef | undefined {
  return GENRES.find((g) => g.slug === slug);
}
