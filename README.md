# Streamly

A movie, TV and anime streaming UI built on [TanStack Start](https://tanstack.com/start) and React Query, with [TMDB](https://www.themoviedb.org/) and [AniList](https://anilist.co/) for metadata, and [VidSrc](https://vidsrc.mov/) as the embedded player. Continue-watching is tracked via `localStorage`.

## Features

- Home page of category blocks (films, series, anime) with 20+ rows, server-rendered and streamed through React Query
- Search across movies and TV
- Movie detail page with embedded player
- TV detail page with season/episode picker
- "Continue Watching" rail and watch history backed by `localStorage`

## Setup

1. Get a free TMDB v3 API key: <https://www.themoviedb.org/settings/api>
2. Copy `.env.example` to `.env` and fill in:

   ```
   TMDB_API_KEY=your_key_here
   # Optional: set both to password-protect the site
   AUTH_USERNAME=
   AUTH_PASSWORD=
   ```

3. Install and run:

   ```
   npm install
   npm run dev        # http://localhost:3000
   ```

   `npm run build` builds with Nitro (auto-detects Vercel when deployed there); `npm start` serves the build locally. `npm run og` re-renders `public/opengraph-image.png`.

## Deploy on Vercel

1. Push to a GitHub repo
2. Import into Vercel
3. Add `TMDB_API_KEY` (and optionally `AUTH_USERNAME` / `AUTH_PASSWORD`) in the Vercel project's environment variables
4. Deploy

## Access control

- **Geoblock**: the request middleware in `src/start.ts` reads Vercel's `x-vercel-ip-country` header and serves a 403 page to any request originating outside Nepal (`NP`). Locally there's no header, so dev is unaffected.
- **Password protection**: when both `AUTH_USERNAME` and `AUTH_PASSWORD` are set, every request is gated by a signed login cookie (sign in at `/login`). Leaving them unset disables auth entirely. Run order is geoblock → auth.

## Architecture

- `src/routes/`: file routes. Loaders prime React Query with `apiQuery(...)` from `lib/api.ts`; components read the same cache with `useSuspenseQuery`.
- `lib/api.ts`: one server function that calls `lib/tmdb.ts` / `lib/anilist.ts` on the server, so `TMDB_API_KEY` never reaches the browser. Upstream responses are cached in memory for an hour (`lib/cache.ts`).
- `src/routes/api/`: JSON endpoints used by client components (search, seasons, cast popovers, filler data).
- `src/start.ts`: request middleware for the geoblock and login cookie.

## How progress tracking works

- Each player iframe (`components/Player.tsx`) listens for `window` `message` events of the form

  ```
  { type: "PLAYER_EVENT", data: { event, currentTime, duration, progress, id, mediaType, season?, episode? } }
  ```

- Updates are throttled to once every 5s for `timeupdate`, then written via `lib/storage.ts`
- The same component reads any saved position on mount and appends `?progress=<seconds>` to the embed URL so the user resumes where they left off
- Stored items are surfaced by `components/RecentlyWatched.tsx` on the homepage

Storage key: `recently-watched-v1`. Capped at 50 items.
