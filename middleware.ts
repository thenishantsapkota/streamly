import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthCookie } from "@/lib/auth";

const ALLOWED_COUNTRY = "NP";

const blockedHtml = (country: string | null) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Unavailable in your region — Streamly</title>
<style>
  :root { color-scheme: dark; }
  html, body { margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    background: #0a0a0c;
    color: #f5f5f7;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Inter, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .card {
    max-width: 520px;
    width: 100%;
    background: #131318;
    border: 1px solid #2a2a35;
    border-radius: 12px;
    padding: 2.25rem 2rem;
    text-align: center;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: .375rem;
    padding: .25rem .625rem;
    background: rgba(229, 9, 20, 0.12);
    color: #ff5560;
    border-radius: 999px;
    font-size: .7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
  }
  h1 { font-size: 1.625rem; margin: .875rem 0 .5rem; letter-spacing: -0.015em; }
  p { color: #9ca3af; line-height: 1.55; margin: 0; font-size: .95rem; }
  code {
    display: inline-block;
    margin-top: 1.25rem;
    padding: .25rem .5rem;
    background: #1c1c24;
    border: 1px solid #2a2a35;
    border-radius: 6px;
    font-size: .75rem;
    color: #9ca3af;
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
const PUBLIC_PATHS = new Set(["/login", "/api/login", "/api/logout"]);

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Geo check — only enforced when a CDN provides a country header.
  const country =
    req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || null;

  if (country && country !== ALLOWED_COUNTRY) {
    return new NextResponse(blockedHtml(country), {
      status: 403,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  // 2. Cookie auth — only enforced when both env vars are configured.
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;
  if (username && password) {
    if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

    const token = req.cookies.get(AUTH_COOKIE)?.value;
    const payload = await verifyAuthCookie(token, password);
    if (!payload) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      const res = NextResponse.redirect(url);
      // If the cookie is present but invalid/expired, clear it so the browser
      // doesn't keep sending it.
      if (token) res.cookies.delete(AUTH_COOKIE);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
