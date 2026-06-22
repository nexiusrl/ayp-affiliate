import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth";

const ADMIN_SESSION_COOKIE = "ayp_admin_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "ayp-affiliate-secret-key-32chars";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip protection check for login page and authenticate endpoint
  if (pathname.startsWith("/admin/login") || pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  // Protect /admin routes and /api/admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isValid = await verifySessionToken(session, SESSION_SECRET);

    if (!isValid) {
      // If API route, return 401 JSON instead of redirecting
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 401 }
        );
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
