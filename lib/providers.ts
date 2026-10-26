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
  /** TMDB logo path (render via `${IMG}/w92${logo}`) */
  logo: string;
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
    logo: "/rK1KljqmbvO9HQa1PBFLILWah72.png",
  },
  {
    id: 337,
    name: "Disney+",
    slug: "disney-plus",
    region: "US",
    color: "#0e6efd",
    tagline: "Marvel, Star Wars and Pixar.",
    logo: "/5eZ872CghnHFLB1j8grszbrx0dx.png",
  },
  {
    id: 9,
    name: "Prime Video",
    slug: "prime-video",
    region: "US",
    color: "#00a8e1",
    tagline: "Prime exclusives across film and TV.",
    logo: "/gMZdpavHmxFNnLpMHwVxfqeux2g.png",
  },
  {
    id: 1899,
    name: "Max",
    slug: "max",
    region: "US",
    color: "#a855f7",
    tagline: "HBO + Max originals.",
    logo: "/skypuy7SXuugIQeYg0IglmzoKaS.png",
  },
  {
    id: 2336,
    name: "JioHotstar",
    slug: "hotstar",
    region: "IN",
    color: "#1f80e0",
    tagline: "JioHotstar exclusives from India.",
    logo: "/ledoS6EgdjTNq8F1e6wubUQer18.png",
  },
  {
    id: 350,
    name: "Apple TV+",
    slug: "apple-tv-plus",
    region: "US",
    color: "#ffffff",
    tagline: "Apple originals.",
    logo: "/9icYBfYFcwgCbky5VdGUIKJ4C5i.png",
  },
  {
    id: 2303,
    name: "Paramount+",
    slug: "paramount-plus",
    region: "US",
    color: "#0058ff",
    tagline: "Star Trek, Yellowstone & more.",
    logo: "/4N4BMd0Mm0kHAmF7RZgL5lW3cwc.png",
  },
];

/** Providers offered in the home page switcher (one row renders at a time). */
export const HOME_PROVIDERS = PROVIDERS;
