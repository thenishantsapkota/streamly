import { createMiddleware, createStart } from "@tanstack/react-start";
import { AUTH_COOKIE, verifyAuthCookie } from "@/lib/auth";

const ALLOWED_COUNTRY = "NP";

const blockedHtml = (country: string | null) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Unavailable in your region - Streamly</title>
<style>
  :root { color-scheme: dark; }
  html, body { margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    background: #0a0a0a;
    color: #ecebe8;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Inter, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .card {
    max-width: 520px;
    width: 100%;
    background: #121212;
    border: 1px solid #262626;
    border-radius: 2px;
    padding: 2.25rem 2rem;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: .375rem;
    padding: .25rem .625rem;
    background: rgba(240, 162, 59, 0.12);
    color: #f0a23b;
    border-radius: 2px;
    font-size: .7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
  }
  h1 { font-size: 1.625rem; margin: .875rem 0 .5rem; letter-spacing: -0.015em; }
  p { color: #8f8e8a; line-height: 1.55; margin: 0; font-size: .95rem; }
  code {
    display: inline-block;
    margin-top: 1.25rem;
    padding: .25rem .5rem;
    background: #1a1a1a;
    border: 1px solid #262626;
    border-radius: 2px;
    font-size: .75rem;
    color: #8f8e8a;
  }
</style>
</head>
<body>
  <main class="card">
    <span class="badge">Region restricted</span>
    <h1>Streamly isn't available in your region.</h1>
    <p>This service is only available from Nepal.</p>
    ${country ? `<code>Detected region: ${escapeHtml(country)}</code>` : ""}
  </main>
</body>
</html>`;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

// Paths that are reachable without authentication.
const PUBLIC_PATHS = new Set([
  "/login",
  "/api/login",
  "/api/logout",
  // PWA assets: reachable so the install prompt and SW can register before login.
  "/sw.js",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
  "/apple-icon.png",
  "/opengraph-image.png",
  "/robots.txt",
  "/sitemap.xml",
]);

function readCookie(header: string | null, name: string) {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

/** Geo-block outside Nepal (when the CDN reports a country) and gate the site behind the login cookie. */
const gate = createMiddleware().server(async ({ request, next }) => {
  const url = new URL(request.url);

  const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || null;
  if (country && country !== ALLOWED_COUNTRY) {
    return new Response(blockedHtml(country), {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  // Cookie auth is only enforced when both env vars are configured.
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;
  const isAsset = url.pathname.startsWith("/assets/") || url.pathname.startsWith("/@") || url.pathname.startsWith("/node_modules/");
  if (username && password && !PUBLIC_PATHS.has(url.pathname) && !isAsset) {
    const token = readCookie(request.headers.get("cookie"), AUTH_COOKIE);
    if (!(await verifyAuthCookie(token, password))) {
      const login = new URL("/login", url);
      login.searchParams.set("next", url.pathname + url.search);
      const headers = new Headers({ Location: login.toString() });
      // Clear an invalid or expired cookie so the browser stops sending it.
      if (token) headers.append("Set-Cookie", `${AUTH_COOKIE}=; Path=/; Max-Age=0`);
      return new Response(null, { status: 307, headers });
    }
  }

  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [gate],
}));
