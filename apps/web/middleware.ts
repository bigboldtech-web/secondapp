import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/checkout",
  "/vendor/dashboard",
  "/vendor/listings",
  "/vendor/orders",
  "/profile",
  "/inbox",
  "/saved",
  "/alerts",
  "/orders",
  "/notifications",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this path is protected
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check for session cookie
  const sessionToken = request.cookies.get("sa_session")?.value;
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists — let the request through (actual verification happens server-side)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/vendor/:path*",
    "/profile/:path*",
    "/inbox/:path*",
    "/saved/:path*",
    "/alerts/:path*",
    "/orders/:path*",
    "/notifications/:path*",
  ],
};
