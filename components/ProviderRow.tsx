import { Row } from "./Row";
import { Reveal } from "./motion";
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
    <section id={provider.slug} className="mt-20 scroll-mt-24 first-of-type:mt-8 [&>section]:mt-10">
      <Reveal className="px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t border-border pt-6">
          <div className="flex items-center gap-4">
            <span aria-hidden className="size-3 shrink-0" style={{ backgroundColor: provider.color }} />
            <h2 className="text-3xl font-semibold tracking-tighter sm:text-5xl">{provider.name}</h2>
          </div>
          <p className="max-w-sm text-sm text-text-dim">{provider.tagline}</p>
        </div>
      </Reveal>
      <Row title="Films" items={movies.results} forceType="movie" />
      <Row title="Series" items={tv.results} forceType="tv" />
    </section>
  );
}
