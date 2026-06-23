import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSessionToken } from "@/lib/auth";

const ADMIN_SESSION_COOKIE = "ayp_admin_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "ayp-affiliate-secret-key-32chars";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Simple in-memory rate limiting map
const loginAttempts = new Map<string, { count: number; lockUntil?: number }>();

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

    // Rate Limit Lock Check
    const attempt = loginAttempts.get(ip) || { count: 0 };
    if (attempt.lockUntil && attempt.lockUntil > Date.now()) {
      const remainingSeconds = Math.ceil((attempt.lockUntil - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal. Akses Anda dikunci. Silakan coba lagi dalam ${remainingSeconds} detik.` },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();

    const validUsername = process.env.ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username !== validUsername || password !== validPassword) {
      attempt.count += 1;
      
      if (attempt.count >= 5) {
        attempt.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
        loginAttempts.set(ip, attempt);
        return NextResponse.json(
          { error: "Terlalu banyak percobaan gagal. Akses Anda dikunci selama 15 menit." },
          { status: 429 }
        );
      }

      loginAttempts.set(ip, attempt);
      const triesLeft = 5 - attempt.count;
      return NextResponse.json(
        { error: `Username atau password salah. Sisa percobaan: ${triesLeft}.` },
        { status: 401 }
      );
    }

    // Reset rate limit count upon successful login
    loginAttempts.delete(ip);

    const token = await createSessionToken(SESSION_SECRET);

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
