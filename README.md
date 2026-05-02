# Streamly

A modern Next.js movie/TV streaming UI powered by [TMDB](https://www.themoviedb.org/) for metadata and the [Vidking](https://www.vidking.net/) embeddable player. Continue-watching is tracked via `localStorage`.

## Features

- Trending, popular, top rated rows for movies and TV (RSC + ISR)
- Search across movies and TV
- Movie detail page with embedded player
- TV detail page with season/episode picker
- "Continue Watching" rail backed by `localStorage`, with resume position
- Listens to the Vidking player's `postMessage` `PLAYER_EVENT`s to record progress

## Setup

1. Get a free TMDB v3 API key: <https://www.themoviedb.org/settings/api>
2. Copy `.env.example` to `.env.local` and fill in:

   ```
   TMDB_API_KEY=your_key_here
   # Optional: set both to password-protect the site
   AUTH_USERNAME=
   AUTH_PASSWORD=
   ```

3. Install and run:

   ```
   npm install
   npm run dev
   ```

## Deploy on Vercel

1. Push to a GitHub repo
2. Import into Vercel
3. Add `TMDB_API_KEY` (and optionally `AUTH_USERNAME` / `AUTH_PASSWORD`) in the Vercel project's environment variables
4. Deploy

## Access control

- **Geoblock**: `middleware.ts` reads Vercel's `x-vercel-ip-country` header and serves a 403 page to any request originating outside Nepal (`NP`). Locally there's no header, so dev is unaffected.
- **Password protection**: when both `AUTH_USERNAME` and `AUTH_PASSWORD` are set, every request is gated by HTTP Basic auth. Leaving them unset disables auth entirely. Run order is geoblock → auth.

## How progress tracking works

- Each player iframe (`components/Player.tsx`) listens for `window` `message` events of the form

  ```
  { type: "PLAYER_EVENT", data: { event, currentTime, duration, progress, id, mediaType, season?, episode? } }
  ```

- Updates are throttled to once every 5s for `timeupdate`, then written via `lib/storage.ts`
- The same component reads any saved position on mount and appends `?progress=<seconds>` to the embed URL so the user resumes where they left off
- Stored items are surfaced by `components/RecentlyWatched.tsx` on the homepage

Storage key: `recently-watched-v1`. Capped at 50 items.
