import { Row } from "./Row";
import { tmdbApi } from "@/lib/tmdb";
import type { Provider } from "@/lib/providers";

type Props = {
  provider: Provider;
  /** Render condensed single-row variant (used on home) instead of the full
   *  movies + TV split (used on the exclusives page). */
  variant?: "condensed" | "full";
};

/**
 * Server component: fetches popular movies (and optionally TV) on the given
 * streaming provider and renders one or two `<Row>`s.
 */
export async function ProviderRow({ provider, variant = "condensed" }: Props) {
  if (variant === "condensed") {
    const movies = await tmdbApi
      .discoverByProvider("movie", provider.id, provider.region)
      .catch(() => ({ results: [] }));
    if (!movies.results.length) return null;
    return (
      <Row
        title={`Exclusively on ${provider.name}`}
        items={movies.results}
        forceType="movie"
        viewAllHref={`/exclusives#${provider.slug}`}
      />
    );
  }

  const [movies, tv] = await Promise.all([
    tmdbApi.discoverByProvider("movie", provider.id, provider.region).catch(() => ({ results: [] })),
    tmdbApi.discoverByProvider("tv", provider.id, provider.region).catch(() => ({ results: [] })),
  ]);

  if (!movies.results.length && !tv.results.length) return null;

  return (
    <section
      id={provider.slug}
      className="mt-12 scroll-mt-20 px-4 sm:px-6"
      style={{ borderColor: provider.color }}
    >
      <div
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-4 pl-3"
        style={{ borderColor: provider.color }}
      >
        <h2 className="text-2xl font-bold tracking-tight">{provider.name}</h2>
        <span className="text-sm text-text-dim">{provider.tagline}</span>
      </div>
      <div className="-mx-4 sm:-mx-6">
        <Row title="Movies" items={movies.results} forceType="movie" />
        <Row title="TV Shows" items={tv.results} forceType="tv" />
      </div>
    </section>
  );
}
