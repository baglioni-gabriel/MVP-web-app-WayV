import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge Middleware for route protection.
 *
 * Note: Firebase Auth uses client-side tokens, so we cannot fully verify
 * the user's role at the Edge layer without setting up session cookies
 * (which is a Phase 8+ enhancement). For now, this middleware provides:
 *
 * 1. A basic presence check — if there's no auth-related cookie/header,
 *    redirect to login.
 * 2. The primary role-based guard happens client-side via AuthGuard.
 *
 * In production, you'd set a session cookie on login (via an API route
 * that verifies the Firebase ID token with firebase-admin) and check
 * that cookie here. That approach will be wired in a later phase.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin route protection (supplementary layer) ──
  // The real guard is the client-side AuthGuard in admin/layout.tsx.
  // This is a defense-in-depth placeholder for future session cookie checks.
  if (pathname.startsWith("/admin")) {
    // In the future, check session cookie here:
    // const session = request.cookies.get("__session");
    // if (!session) { return NextResponse.redirect(new URL("/login", request.url)); }

    // For now, let it through — the client-side AuthGuard handles protection.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on admin routes (extend as needed)
  matcher: ["/admin/:path*"],
};
