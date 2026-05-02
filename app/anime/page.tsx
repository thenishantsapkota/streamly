import { AnimeIndexContent } from "./AnimeIndexContent";
import { anilistApi } from "@/lib/anilist";

export const revalidate = 3600;
export const metadata = {
  title: "Anime",
  description: "Browse trending, popular, and top-rated anime on Streamly. Sub & dub auto-detected.",
  alternates: { canonical: "/anime" },
  openGraph: { title: "Anime · Streamly", url: "/anime" },
};

export default async function AnimeIndexPage() {
  const [trending, popular, topRated] = await Promise.all([
    anilistApi.trending(24),
    anilistApi.popular(24),
    anilistApi.topRated(24),
  ]);

  return <AnimeIndexContent initial={{ trending, popular, topRated }} />;
}
