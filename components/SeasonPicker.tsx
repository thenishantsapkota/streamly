"use client";

import { useEffect, useState } from "react";
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
};

export function SeasonPicker({ tvId, seasons, initialSeason, initialEpisode, asLinks = true, onPick }: Props) {
  const validSeasons = seasons.filter((s) => s.season_number > 0 && s.episode_count > 0);
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
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg shimmer" />
        ))}
        {!loading && eps?.map((ep) => {
          const active = season === initialSeason && initialEpisode === ep.episode_number;
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
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono text-text-dim">E{ep.episode_number}</span>
                  <h3 className="truncate text-sm font-medium">{ep.name}</h3>
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
