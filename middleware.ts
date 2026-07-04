import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const session = token
    ? await verifyToken(token)
    : null;

  const isAuthenticated = !!session;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Protect authenticated routes
  if (!isAuthenticated && pathname.startsWith("/feed")) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Prevent authenticated users from visiting auth pages
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(
      new URL("/feed", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/login",
    "/register",
  ],
};
