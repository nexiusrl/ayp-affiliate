import { NextResponse, type NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "ayp_admin_session";
const SESSION_VALUE = process.env.SESSION_SECRET || "ayp-affiliate-secret";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (session !== SESSION_VALUE) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
