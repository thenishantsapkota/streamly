export type Provider = {
  /** TMDB watch-provider id (region-specific) */
  id: number;
  /** Display name */
  name: string;
  /** Slug for `/exclusives#<slug>` anchors */
  slug: string;
  /** TMDB region code to query against (provider availability is per-region) */
  region: string;
  /** Brand colour for accent pills/borders */
  color: string;
  /** Short tagline */
  tagline: string;
};

/**
 * Curated list of streaming-platform exclusives. Provider IDs come from
 * TMDB's `/watch/providers/{movie|tv}` reference and are region-specific —
 * Hotstar in particular is only meaningful for `IN`.
 */
export const PROVIDERS: Provider[] = [
  {
    id: 8,
    name: "Netflix",
    slug: "netflix",
    region: "US",
    color: "#e50914",
    tagline: "Originals you can only watch on Netflix.",
  },
  {
    id: 337,
    name: "Disney+",
    slug: "disney-plus",
    region: "US",
    color: "#0e6efd",
    tagline: "Marvel, Star Wars, Pixar — all in one place.",
  },
  {
    id: 9,
    name: "Prime Video",
    slug: "prime-video",
    region: "US",
    color: "#00a8e1",
    tagline: "Prime exclusives across film and TV.",
  },
  {
    id: 1899,
    name: "Max",
    slug: "max",
    region: "US",
    color: "#a855f7",
    tagline: "HBO + Max originals.",
  },
  {
    id: 122,
    name: "Hotstar",
    slug: "hotstar",
    region: "IN",
    color: "#1f80e0",
    tagline: "Disney+ Hotstar India exclusives.",
  },
  {
    id: 350,
    name: "Apple TV+",
    slug: "apple-tv-plus",
    region: "US",
    color: "#ffffff",
    tagline: "Apple originals.",
  },
  {
    id: 531,
    name: "Paramount+",
    slug: "paramount-plus",
    region: "US",
    color: "#0058ff",
    tagline: "Star Trek, Yellowstone & more.",
  },
];

/** Providers featured on the home page (kept short to limit network/render). */
export const HOME_PROVIDERS = PROVIDERS.filter((p) =>
  ["netflix", "disney-plus", "prime-video", "hotstar"].includes(p.slug),
);
