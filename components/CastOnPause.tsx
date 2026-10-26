"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DraggableScroll } from "./DraggableScroll";
import { EASE_CINEMA } from "./motion";

export type CastEntry = {
  /** Person/voice-actor id used to fetch real-life details */
  personId: number;
  /** Real-world person name (actor / voice actor) */
  personName: string;
  /** Photo of the person */
  personImage: string | null;
  /** Character name they play */
  character: string;
  /** Image of the character (anime) */
  characterImage?: string | null;
  /** AniList character id (anime), enables character popups */
  characterId?: number;
};

type Source = "tmdb" | "anilist";

type FetchedDetails = {
  name: string;
  image: string | null;
  blurbLines: string[];
  description: string | null;
};

const HOVER_DELAY_MS = 200;

export function CastOnPause({
  visible,
  cast,
  source,
}: {
  visible: boolean;
  cast: CastEntry[];
  source: Source;
}) {
  const [active, setActive] = useState<{ entry: CastEntry; rect: DOMRect } | null>(null);
  const cacheRef = useRef(new Map<string, FetchedDetails>());
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  function clearHoverTimer() {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }

  // Hide popover when the panel hides (player resumes)
  useEffect(() => {
    if (!visible) setActive(null);
  }, [visible]);

  if (cast.length === 0) return null;

  return (
    <>
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            key="cast-panel"
            className="relative overflow-hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: EASE_CINEMA }}
          >
            <div className="mt-4 border-t border-border pt-5">
              <div className="mb-4 flex items-end gap-4">
                <h3 className="shrink-0 text-lg font-semibold tracking-tight">
                  <span className="mr-2 text-xs font-medium uppercase tracking-wider text-brand">Paused</span>
                  Cast
                </h3>
                <span aria-hidden className="mb-1.5 h-px flex-1 bg-border" />
                <span className="mb-0.5 hidden shrink-0 text-xs text-text-dim sm:inline">Hover for details</span>
              </div>
              <DraggableScroll className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
                {cast.map((c, i) => (
                  <motion.button
                    type="button"
                    key={`${c.personId}-${c.character}`}
                    initial={reduce ? false : { opacity: 0, x: 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: Math.min(i, 7) * 0.04, ease: EASE_CINEMA }}
                    onMouseEnter={(e) => {
                      clearHoverTimer();
                      const card = e.currentTarget;
                      hoverTimerRef.current = setTimeout(() => {
                        setActive({ entry: c, rect: card.getBoundingClientRect() });
                      }, HOVER_DELAY_MS);
                    }}
                    onMouseLeave={() => {
                      clearHoverTimer();
                      setActive((prev) => (prev?.entry === c ? null : prev));
                    }}
                    onClick={(e) => {
                      clearHoverTimer();
                      const card = e.currentTarget;
                      setActive((prev) =>
                        prev?.entry === c ? null : { entry: c, rect: card.getBoundingClientRect() },
                      );
                    }}
                    className="group relative w-24 shrink-0 text-left sm:w-28"
                  >
                    <div className="aspect-3/4 overflow-hidden bg-surface-2 shadow-[0_0_0_1px_var(--color-border)] transition-shadow duration-500 group-hover:shadow-[0_0_0_1px_var(--color-brand)]">
                      {c.personImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.personImage}
                          alt={c.personName}
                          className="h-full w-full object-cover grayscale-[35%] transition duration-700 ease-cinema group-hover:scale-105 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-text-dim">No photo</div>
                      )}
                    </div>
                    <div className="mt-2 line-clamp-1 text-xs font-medium transition-colors group-hover:text-brand">{c.personName}</div>
                    {c.character && <div className="line-clamp-1 text-[11px] text-text-dim">as {c.character}</div>}
                  </motion.button>
                ))}
              </DraggableScroll>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {active && (
        <>
          {/* Tap-to-dismiss backdrop for touch devices */}
          <div
            className="fixed inset-0 z-30 sm:hidden"
            onClick={() => setActive(null)}
            aria-hidden
          />
          <CastPopover
            entry={active.entry}
            source={source}
            cache={cacheRef.current}
            anchorRect={active.rect}
            onClose={() => setActive(null)}
          />
        </>
      )}
    </>
  );
}

function CastPopover({
  entry,
  source,
  cache,
  anchorRect,
  onClose,
}: {
  entry: CastEntry;
  source: Source;
  cache: Map<string, FetchedDetails>;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const cacheKey = `${source}-person-${entry.personId}`;
  const charKey = source === "anilist" && entry.characterId ? `anilist-char-${entry.characterId}` : null;

  const [person, setPerson] = useState<FetchedDetails | null>(cache.get(cacheKey) ?? null);
  const [character, setCharacter] = useState<FetchedDetails | null>(
    charKey ? cache.get(charKey) ?? null : null,
  );

  useEffect(() => {
    let cancel = false;
    if (!person) {
      const url =
        source === "tmdb"
          ? `/api/person?id=${entry.personId}`
          : `/api/character?id=${entry.personId}&kind=staff`;
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (cancel) return;
          const fd: FetchedDetails =
            source === "tmdb"
              ? {
                  name: data.name ?? entry.personName,
                  image: data.profile_path
                    ? `https://image.tmdb.org/t/p/w185${data.profile_path}`
                    : entry.personImage,
                  blurbLines: [
                    data.known_for_department ? `${data.known_for_department}` : "",
                    data.birthday
                      ? `Born ${data.birthday}${data.place_of_birth ? `, ${data.place_of_birth}` : ""}`
                      : "",
                    data.deathday ? `Died ${data.deathday}` : "",
                  ].filter(Boolean),
                  description: data.biography ?? null,
                }
              : {
                  name: data.name ?? entry.personName,
                  image: data.image ?? entry.personImage,
                  blurbLines: [
                    "Voice Actor",
                    data.homeTown ? `From ${data.homeTown}` : "",
                    data.age != null ? `Age ${data.age}` : "",
                  ].filter(Boolean),
                  description: data.description ?? null,
                };
          cache.set(cacheKey, fd);
          setPerson(fd);
        })
        .catch(() => {
          if (cancel) return;
          setPerson({
            name: entry.personName,
            image: entry.personImage,
            blurbLines: [],
            description: null,
          });
        });
    }
    if (charKey && !character && entry.characterId) {
      fetch(`/api/character?id=${entry.characterId}&kind=character`)
        .then((r) => r.json())
        .then((data) => {
          if (cancel) return;
          const fd: FetchedDetails = {
            name: data.name ?? entry.character,
            image: data.image ?? entry.characterImage ?? null,
            blurbLines: [data.gender, data.age ? `Age ${data.age}` : ""].filter(Boolean) as string[],
            description: data.description ?? null,
          };
          cache.set(charKey, fd);
          setCharacter(fd);
        })
        .catch(() => {});
    }
    return () => {
      cancel = true;
    };
  }, [entry, source, cacheKey, charKey, person, character, cache]);

  // position popover above the card
  const top = Math.max(8, anchorRect.top + window.scrollY - 8);
  const left = Math.max(8, Math.min(window.innerWidth - 360, anchorRect.left + window.scrollX));

  return (
    <div
      onMouseEnter={() => {
        /* keep open while hovering popover */
      }}
      onMouseLeave={onClose}
      className="fixed z-40 w-[min(20rem,calc(100vw-1rem))] -translate-y-full"
      style={{ top, left }}
      role="tooltip"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: EASE_CINEMA }}
        className="border border-border border-t-brand bg-surface p-4 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.85)]"
      >
      <div className="flex gap-3">
        {person?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.image}
            alt=""
            className="h-20 w-16 shrink-0 object-cover ring-1 ring-border"
          />
        ) : (
          <div className="h-20 w-16 shrink-0 bg-surface-2 ring-1 ring-border" />
        )}
        <div className="min-w-0 flex-1">
          <div className="font-display text-base font-semibold leading-tight">{person?.name ?? entry.personName}</div>
          <div className="text-xs text-text-dim">
            as <span className="text-brand">{entry.character}</span>
          </div>
          {person?.blurbLines.map((b, i) => (
            <div key={i} className="mt-0.5 tabular-nums text-[11px] text-text-dim">
              {b}
            </div>
          ))}
        </div>
      </div>
      {(character?.description || person?.description) && (
        <p className="mt-3 line-clamp-5 text-xs leading-relaxed text-text-dim">
          {character?.description || person?.description}
        </p>
      )}
      {character && (
        <div className="mt-3 border-t border-border pt-2">
          <div className="text-[11px] uppercase tracking-wider text-text-dim">Character</div>
          <div className="mt-1 flex items-center gap-2">
            {character.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={character.image} alt="" className="h-10 w-10 rounded-full object-cover" />
            )}
            <div className="text-xs">{character.name}</div>
          </div>
        </div>
      )}
      </motion.div>
    </div>
  );
}
