import { NextRequest, NextResponse } from "next/server";
import { createSession, safeEqual } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Login not configured. Set ADMIN_USER and ADMIN_PASSWORD in .env.local" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body?.username || "");
  const password = String(body?.password || "");

  const okUser = safeEqual(username, process.env.ADMIN_USER);
  const okPass = safeEqual(password, process.env.ADMIN_PASSWORD);
  if (!okUser || !okPass) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const token = await createSession(username);
  const res = NextResponse.json({ success: true });
  res.cookies.set("mc_session", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    // Enable only behind HTTPS (e.g. Vercel). Must stay off for `npm start` on http://localhost.
    secure: process.env.COOKIE_SECURE === "true",
  });
  return res;
}
