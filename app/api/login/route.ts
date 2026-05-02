import { NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_TTL_SECONDS, safeNext, signAuthCookie } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const form = await req.formData();
  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));

  const expectedUser = process.env.AUTH_USERNAME;
  const expectedPass = process.env.AUTH_PASSWORD;

  // If auth isn't configured, just send them home.
  if (!expectedUser || !expectedPass) {
    return NextResponse.redirect(new URL(next, req.url), { status: 303 });
  }

  if (username !== expectedUser || password !== expectedPass) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "1");
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await signAuthCookie(expectedPass);
  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_TTL_SECONDS,
  });
  return res;
}
