import { createFileRoute } from "@tanstack/react-router";
import { AUTH_COOKIE, AUTH_TTL_SECONDS, safeNext, signAuthCookie } from "@/lib/auth";

function redirect(to: URL, cookie?: string) {
  const headers = new Headers({ Location: to.toString() });
  if (cookie) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export const Route = createFileRoute("/api/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const username = String(form.get("username") ?? "");
        const password = String(form.get("password") ?? "");
        const next = safeNext(form.get("next"));

        const expectedUser = process.env.AUTH_USERNAME;
        const expectedPass = process.env.AUTH_PASSWORD;

        // If auth isn't configured, just send them home.
        if (!expectedUser || !expectedPass) return redirect(new URL(next, request.url));

        if (username !== expectedUser || password !== expectedPass) {
          const url = new URL("/login", request.url);
          url.searchParams.set("error", "1");
          if (next !== "/") url.searchParams.set("next", next);
          return redirect(url);
        }

        const token = await signAuthCookie(expectedPass);
        const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
        return redirect(
          new URL(next, request.url),
          `${AUTH_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AUTH_TTL_SECONDS}${secure}`,
        );
      },
    },
  },
});
