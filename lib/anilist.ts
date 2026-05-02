const ANILIST = "https://graphql.anilist.co";

export type AnimeFormat = "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | "OVA" | "ONA" | "MUSIC";

export interface StreamingEpisode {
  title: string | null;
  thumbnail: string | null;
  url: string | null;
}

export interface Anime {
  id: number;
  idMal: number | null;
  title: { romaji: string; english: string | null; native: string | null };
  description: string | null;
  coverImage: { large: string; extraLarge: string | null; color: string | null };
  bannerImage: string | null;
  format: AnimeFormat | null;
  episodes: number | null;
  duration: number | null;
  averageScore: number | null;
  seasonYear: number | null;
  genres: string[];
  status: string;
  isAdult: boolean;
  nextAiringEpisode: { episode: number } | null;
  streamingEpisodes: StreamingEpisode[] | null;
}

const LIST_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage
  format
  episodes
  averageScore
  seasonYear
  genres
  status
  isAdult
  nextAiringEpisode { episode }
`;

const DETAIL_FIELDS = `
  id
  idMal
  title { romaji english native }
  description(asHtml: false)
  coverImage { large extraLarge color }
  bannerImage
  format
  episodes
  duration
  averageScore
  seasonYear
  genres
  status
  isAdult
  nextAiringEpisode { episode }
  streamingEpisodes { title thumbnail url }
`;

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ANILIST, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json = (await res.json()) as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

export const anilistApi = {
  trending: async (perPage = 24) => {
    const data = await gql<{ Page: { media: Anime[] } }>(
      `query ($perPage: Int) {
        Page(perPage: $perPage) {
          media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ${LIST_FIELDS} }
        }
      }`,
      { perPage },
    );
    return data.Page.media;
  },

  popular: async (perPage = 24) => {
    const data = await gql<{ Page: { media: Anime[] } }>(
      `query ($perPage: Int) {
        Page(perPage: $perPage) {
          media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) { ${LIST_FIELDS} }
        }
      }`,
      { perPage },
    );
    return data.Page.media;
  },

  topRated: async (perPage = 24) => {
    const data = await gql<{ Page: { media: Anime[] } }>(
      `query ($perPage: Int) {
        Page(perPage: $perPage) {
          media(sort: SCORE_DESC, type: ANIME, isAdult: false) { ${LIST_FIELDS} }
        }
      }`,
      { perPage },
    );
    return data.Page.media;
  },

  byId: async (id: number | string) => {
    const data = await gql<{ Media: Anime }>(
      `query ($id: Int) { Media(id: $id, type: ANIME) { ${DETAIL_FIELDS} } }`,
      { id: Number(id) },
    );
    return data.Media;
  },

  search: async (term: string, perPage = 24) => {
    const data = await gql<{ Page: { media: Anime[] } }>(
      `query ($search: String, $perPage: Int) {
        Page(perPage: $perPage) {
          media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) { ${LIST_FIELDS} }
        }
      }`,
      { search: term, perPage },
    );
    return data.Page.media;
  },
};

export function animeTitle(a: Pick<Anime, "title">): string {
  return a.title.english || a.title.romaji || a.title.native || "Untitled";
}

export interface CharacterEdge {
  id: number;
  role: "MAIN" | "SUPPORTING" | "BACKGROUND" | string;
  name: string;
  image: string | null;
  voiceActor: {
    id: number;
    name: string;
    image: string | null;
    languageV2: string | null;
  } | null;
}

export interface CharacterDetails {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  gender: string | null;
  age: string | null;
}

export interface VoiceActorDetails {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  homeTown: string | null;
  age: number | null;
}

export const anilistExtra = {
  characters: async (animeId: number | string): Promise<CharacterEdge[]> => {
    const data = await gql<{
      Media: {
        characters: {
          edges: Array<{
            role: string;
            node: { id: number; name: { full: string }; image: { large: string | null } };
            voiceActors: Array<{
              id: number;
              name: { full: string };
              image: { large: string | null };
              languageV2: string | null;
            }>;
          }>;
        };
      };
    }>(
      `query ($id: Int) {
        Media(id: $id, type: ANIME) {
          characters(sort: [ROLE, RELEVANCE], perPage: 24) {
            edges {
              role
              node { id name { full } image { large } }
              voiceActors(language: JAPANESE, sort: [RELEVANCE]) {
                id name { full } image { large } languageV2
              }
            }
          }
        }
      }`,
      { id: Number(animeId) },
    );
    return data.Media.characters.edges.map((e) => ({
      id: e.node.id,
      role: e.role,
      name: e.node.name.full,
      image: e.node.image.large,
      voiceActor: e.voiceActors[0]
        ? {
            id: e.voiceActors[0].id,
            name: e.voiceActors[0].name.full,
            image: e.voiceActors[0].image.large,
            languageV2: e.voiceActors[0].languageV2,
          }
        : null,
    }));
  },

  character: async (id: number | string): Promise<CharacterDetails> => {
    const data = await gql<{
      Character: {
        id: number;
        name: { full: string };
        image: { large: string | null };
        description: string | null;
        gender: string | null;
        age: string | null;
      };
    }>(
      `query ($id: Int) {
        Character(id: $id) {
          id name { full } image { large } description(asHtml: false) gender age
        }
      }`,
      { id: Number(id) },
    );
    return {
      id: data.Character.id,
      name: data.Character.name.full,
      image: data.Character.image.large,
      description: data.Character.description,
      gender: data.Character.gender,
      age: data.Character.age,
    };
  },

  staff: async (id: number | string): Promise<VoiceActorDetails> => {
    const data = await gql<{
      Staff: {
        id: number;
        name: { full: string };
        image: { large: string | null };
        description: string | null;
        homeTown: string | null;
        age: number | null;
      };
    }>(
      `query ($id: Int) {
        Staff(id: $id) {
          id name { full } image { large } description(asHtml: false) homeTown age
        }
      }`,
      { id: Number(id) },
    );
    return {
      id: data.Staff.id,
      name: data.Staff.name.full,
      image: data.Staff.image.large,
      description: data.Staff.description,
      homeTown: data.Staff.homeTown,
      age: data.Staff.age,
    };
  },
};

export function animeIsMovie(a: Pick<Anime, "format">): boolean {
  return a.format === "MOVIE" || a.format === "MUSIC";
}

/**
 * Returns the best-known episode count for an anime. AniList sets `episodes`
 * to null for ongoing/long-running series (e.g. One Piece) — fall back to
 * `nextAiringEpisode.episode - 1` (last aired) and finally to the size of
 * `streamingEpisodes`. If none of those are available, returns null.
 */
export function getEpisodeCount(
  a: Pick<Anime, "episodes" | "nextAiringEpisode" | "streamingEpisodes">,
): number | null {
  if (a.episodes && a.episodes > 0) return a.episodes;
  if (a.nextAiringEpisode?.episode && a.nextAiringEpisode.episode > 1) {
    return a.nextAiringEpisode.episode - 1;
  }
  if (a.streamingEpisodes && a.streamingEpisodes.length > 0) {
    return a.streamingEpisodes.length;
  }
  return null;
}
