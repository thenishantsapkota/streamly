import { createFileRoute } from "@tanstack/react-router";
import { AUTH_COOKIE } from "@/lib/auth";

export const Route = createFileRoute("/api/logout")({
  server: {
    handlers: {
      POST: ({ request }) =>
        new Response(null, {
          status: 303,
          headers: {
            Location: new URL("/login", request.url).toString(),
            "Set-Cookie": `${AUTH_COOKIE}=; Path=/; Max-Age=0`,
          },
        }),
    },
  },
});
