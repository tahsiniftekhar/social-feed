import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const AUTH_COOKIE_NAME = "auth_token";

export const authCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
