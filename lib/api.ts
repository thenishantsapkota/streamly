import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { tmdbApi } from "./tmdb";
import { anilistApi, anilistExtra } from "./anilist";

/**
 * Single server-side entry point for upstream data. Every call goes through
 * this server function, so TMDB_API_KEY and upstream fetches stay on the
 * server; the browser only ever talks to our own origin.
 */
const APIS = { tmdb: tmdbApi, anilist: anilistApi, anilistExtra };
type Apis = typeof APIS;
type ApiName = keyof Apis;
type Method<A extends ApiName> = keyof Apis[A] & string;
type Fn<A extends ApiName, M extends Method<A>> = Apis[A][M] extends (...args: infer P) => infer R
  ? (...args: P) => R
  : never;

const callApi = createServerFn({ method: "GET" })
  .validator((input: { api: string; method: string; args: unknown[] }) => {
    if (!(input.api in APIS)) throw new Error(`Unknown api: ${input.api}`);
    const target = APIS[input.api as ApiName] as Record<string, unknown>;
    if (typeof target[input.method] !== "function") throw new Error(`Unknown method: ${input.api}.${input.method}`);
    if (!Array.isArray(input.args)) throw new Error("args must be an array");
    return input;
  })
  .handler(async ({ data }) => {
    const target = APIS[data.api as ApiName] as Record<string, (...args: unknown[]) => Promise<unknown>>;
    // Results are plain JSON from TMDB/AniList.
    return JSON.parse(JSON.stringify(await target[data.method](...data.args))) as never;
  });

/** Call an upstream API method on the server, from anywhere (loader or component). */
export function callUpstream<A extends ApiName, M extends Method<A>>(
  api: A,
  method: M,
  ...args: Parameters<Fn<A, M>>
): ReturnType<Fn<A, M>> {
  return callApi({ data: { api, method, args } }) as ReturnType<Fn<A, M>>;
}

/**
 * React Query options for an upstream call. Loaders prime the cache with
 * `queryClient.ensureQueryData(apiQuery(...))`; components read the same
 * entry with `useSuspenseQuery(apiQuery(...))`.
 */
export function apiQuery<A extends ApiName, M extends Method<A>>(
  api: A,
  method: M,
  ...args: Parameters<Fn<A, M>>
) {
  return queryOptions({
    queryKey: [api, method, ...args] as readonly unknown[],
    queryFn: () => callUpstream(api, method, ...args) as Promise<Awaited<ReturnType<Fn<A, M>>>>,
  });
}

/** Like apiQuery, but resolves to `fallback` instead of throwing (optional page sections). */
export function apiQueryOr<A extends ApiName, M extends Method<A>, F>(
  fallback: F,
  api: A,
  method: M,
  ...args: Parameters<Fn<A, M>>
) {
  return queryOptions({
    queryKey: [api, method, ...args, "or"] as readonly unknown[],
    queryFn: async (): Promise<Awaited<ReturnType<Fn<A, M>>> | F> => {
      try {
        return (await callUpstream(api, method, ...args)) as Awaited<ReturnType<Fn<A, M>>>;
      } catch {
        return fallback;
      }
    },
  });
}
