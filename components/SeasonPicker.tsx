"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { stillUrl, type Episode, type Season } from "@/lib/tmdb";

type Props = {
  tvId: number;
  seasons: Season[];
  initialSeason: number;
  initialEpisode?: number;
  /** when set, render episode rows as <Link>s to /tv/{id}/watch?s=&e= */
  asLinks?: boolean;
  /** when set, used as the click handler instead of links */
  onPick?: (season: number, episode: number) => void;
  /**
   * MyAnimeList ID for filler-episode lookup. When provided (and TMDB seasons
   * map 1:1 to AniList absolute episodes), shows F/R badges on episodes.
   */
  malId?: number | null;
};

const JIKAN_PAGE_SIZE = 100;

type FillerMap = Record<number, { filler: boolean; recap: boolean }>;

export function SeasonPicker({
  tvId,
  seasons,
  initialSeason,
  initialEpisode,
  asLinks = true,
  onPick,
  malId,
}: Props) {
  const validSeasons = useMemo(
    () => seasons.filter((s) => s.season_number > 0 && s.episode_count > 0),
    [seasons],
  );
  const [season, setSeason] = useState(initialSeason);
  const [eps, setEps] = useState<Episode[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let aborted = false;
    setLoading(true);
    fetch(`/api/season?tv=${tvId}&season=${season}`)
      .then((r) => r.json())
      .then((d) => {
        if (!aborted) setEps(d.episodes ?? []);
      })
      .catch(() => {
        if (!aborted) setEps([]);
      })
      .finally(() => !aborted && setLoading(false));
    return () => {
      aborted = true;
    };
  }, [tvId, season]);

  // Compute the offset that converts (season, episode) → MAL absolute episode
  // by summing prior seasons' episode counts. Best-effort — assumes the AniList
  // entry covers the whole show. For long-running shows split into multiple
  // AniList entries, badges may not match.
  const malEpisodeOffset = useMemo(() => {
    if (!malId) return 0;
    let offset = 0;
    for (const s of validSeasons) {
      if (s.season_number >= season) break;
      offset += s.episode_count;
    }
    return offset;
  }, [malId, season, validSeasons]);

  // Fetch jikan filler info for the current season's range.
  const [fillerByAbs, setFillerByAbs] = useState<FillerMap>({});
  useEffect(() => {
    if (!malId || !eps || eps.length === 0) return;
    const firstAbs = malEpisodeOffset + 1;
    const lastAbs = malEpisodeOffset + eps.length;
    const firstPage = Math.floor((firstAbs - 1) / JIKAN_PAGE_SIZE) + 1;
    const lastPage = Math.floor((lastAbs - 1) / JIKAN_PAGE_SIZE) + 1;
    const pages: number[] = [];
    for (let p = firstPage; p <= lastPage; p++) pages.push(p);

    let cancelled = false;
    Promise.all(
      pages.map((p) =>
        fetch(`/api/anime/episodes?mal=${malId}&page=${p}`)
          .then((r) => r.json())
          .then((j) => (j.data ?? []) as Array<{ mal_id: number; filler: boolean; recap: boolean }>)
          .catch(() => [] as Array<{ mal_id: number; filler: boolean; recap: boolean }>),
      ),
    ).then((arrays) => {
      if (cancelled) return;
      setFillerByAbs((prev) => {
        const next = { ...prev };
        for (const arr of arrays) {
          for (const e of arr) next[e.mal_id] = { filler: !!e.filler, recap: !!e.recap };
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [malId, eps, malEpisodeOffset]);

  return (
    <div className="mt-4 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Episodes</h2>
        <select
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
          className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60"
        >
          {validSeasons.map((s) => (
            <option key={s.id} value={s.season_number}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {malId && (
        <p className="mt-2 text-xs text-text-dim">
          <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-300 px-1.5 py-0.5 font-mono text-[10px] mr-1.5">
            F
          </span>
          marks filler episodes (data from MyAnimeList).
        </p>
      )}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg shimmer" />
        ))}
        {!loading && eps?.map((ep) => {
          const active = season === initialSeason && initialEpisode === ep.episode_number;
          const absEp = malEpisodeOffset + ep.episode_number;
          const meta = fillerByAbs[absEp];
          const inner = (
            <div className={`flex gap-3 rounded-lg border p-3 transition ${
              active
                ? "border-brand bg-brand/10"
                : "border-border bg-surface hover:border-brand/60"
            }`}>
              <div className="relative w-32 shrink-0 overflow-hidden rounded-md bg-surface-2">
                {ep.still_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={stillUrl(ep.still_path, "w300") ?? ""} alt="" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video w-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-dim">E{ep.episode_number}</span>
                  <h3 className="truncate text-sm font-medium flex-1">{ep.name}</h3>
                  {meta?.filler && (
                    <span className="shrink-0 rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                      F
                    </span>
                  )}
                  {meta?.recap && !meta?.filler && (
                    <span className="shrink-0 rounded bg-sky-500/20 text-sky-300 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                      R
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-text-dim">{ep.overview || "No description."}</p>
              </div>
            </div>
          );
          if (asLinks) {
            return (
              <Link key={ep.id} href={`/tv/${tvId}/watch?s=${season}&e=${ep.episode_number}`}>
                {inner}
              </Link>
            );
          }
          return (
            <button key={ep.id} onClick={() => onPick?.(season, ep.episode_number)} className="text-left">
              {inner}
            </button>
          );
        })}
        {!loading && eps && eps.length === 0 && (
          <p className="col-span-full text-sm text-text-dim">No episodes for this season.</p>
        )}
      </div>
    </div>
  );
}
